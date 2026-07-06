import { zValidator } from '@hono/zod-validator';
import { count, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { items, stockIns, stockOuts } from '../db/schema';
import { type AuthEnv, requireAuth } from '../middleware/auth';

/**
 * DB の timestamp(0) 文字列を Laravel の JSON シリアライズ形式に変換する。
 * ドライバによって 'YYYY-MM-DD HH:mm:ss' / 'YYYY-MM-DDTHH:mm:ss.SSS' の揺れがあるため
 * 秒までに正規化してから Laravel 形式のサフィックスを付ける。
 */
const toLaravelTimestamp = (value: string | null): string | null =>
  value === null ? null : `${value.replace(' ', 'T').slice(0, 19)}.000000Z`;

/** 現在時刻を DB の timestamp(0) 形式(UTC)で返す。Laravel の save() 時刻更新の代替。 */
const nowTimestamp = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

type ItemRow = typeof items.$inferSelect;

/** Drizzle の行を現行 Laravel の JSON レスポンス形(migration-spec.md §3.1)に変換する。 */
const toResponseItem = (row: ItemRow) => ({
  id: row.id,
  productName: row.productName,
  modelNumber: row.modelNumber,
  location: row.location,
  inventoryItem: row.inventoryItem,
  quantityChange: row.quantityChange,
  remarks: row.remarks,
  created_at: toLaravelTimestamp(row.createdAt),
  updated_at: toLaravelTimestamp(row.updatedAt),
});

// Laravel の ConvertEmptyStringsToNull ミドルウェアを再現: 空文字は null として扱う
const emptyToNull = (v: unknown) => (v === '' ? null : v);
// Laravel の numeric ルール相当: 数値または数値文字列(§3.4 の厳密比較 !== 0 の再現に型を保持)
const numericLike = z.union([
  z.number(),
  z.string().regex(/^-?\d+(\.\d+)?$/, 'quantityChange must be numeric'),
]);

const listQuerySchema = z.object({
  per_page: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
});

const updateSchema = z.object({
  productName: z.preprocess(emptyToNull, z.string()),
  modelNumber: z.preprocess(emptyToNull, z.string()),
  location: z.preprocess(emptyToNull, z.string()),
  quantityChange: numericLike,
  remarks: z.preprocess(emptyToNull, z.string().nullable()).optional(),
});

/**
 * 在庫アイテム API(migration-spec.md §3.1 / §3.4 の忠実移植)。
 * トランザクションを張らない・在庫不足でも 200・存在しない id は 500 等、
 * 現行 Laravel の挙動(バグ含む)を意図的に再現している。変更前に §1.3 を参照のこと。
 */
export const itemRoutes = new Hono<AuthEnv>()
  .use('*', requireAuth)
  .get(
    '/',
    zValidator('query', listQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: 'The given data was invalid.' }, 422);
      }
    }),
    async (c) => {
      const { per_page: perPage = 100, page = 1 } = c.req.valid('query');

      const [rows, [totalRow]] = await Promise.all([
        db
          .select()
          .from(items)
          .orderBy(items.id)
          .limit(perPage)
          .offset((page - 1) * perPage),
        db.select({ value: count() }).from(items),
      ]);
      const total = totalRow?.value ?? 0;

      // Laravel 標準ページネータ互換(フロントが依存する最小キーを再現)
      return c.json({
        current_page: page,
        data: rows.map(toResponseItem),
        last_page: Math.max(Math.ceil(total / perPage), 1),
        per_page: perPage,
        total,
      });
    },
  )
  .put(
    '/:id',
    zValidator('json', updateSchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            message: 'The given data was invalid.',
            errors: z.flattenError(result.error).fieldErrors,
          },
          422,
        );
      }
    }),
    async (c) => {
      const id = c.req.param('id');
      const body = c.req.valid('json');

      try {
        const [item] = await db
          .select()
          .from(items)
          .where(eq(items.id, Number(id)));
        if (!item) {
          // Laravel の ModelNotFoundException メッセージを踏襲(catch されて 500 になる)
          throw new Error(`No query results for model [App\\Models\\Item] ${id}`);
        }

        let message = 'アイテムが正常に更新されました。';
        let newInventoryItem: number | undefined;

        // PHP の厳密比較 !== 0 を再現: 数値 0 のみスキップ。文字列 "0" は分岐に入る(§3.4)
        if (body.quantityChange !== 0) {
          const quantityChange = Number(body.quantityChange);
          const currentQuantity = item.inventoryItem ?? 0;
          const newQuantity = currentQuantity + quantityChange;

          if (quantityChange > 0) {
            const now = nowTimestamp();
            await db.insert(stockIns).values({
              itemId: item.id,
              inItem: quantityChange,
              createdAt: now,
              updatedAt: now,
            });
            newInventoryItem = newQuantity;
            message += ' 入庫処理が完了しました。';
          } else if (quantityChange < 0) {
            if (newQuantity < 0) {
              // 在庫不足: stock_outs は作らず、編集内容は保存したまま 200 を返す(現行仕様)
              message += ' 在庫数量の更新に失敗しました: エラー: 在庫不足のため出庫できません。';
            } else {
              const now = nowTimestamp();
              await db.insert(stockOuts).values({
                itemId: item.id,
                outItem: Math.abs(quantityChange),
                createdAt: now,
                updatedAt: now,
              });
              newInventoryItem = newQuantity;
              message += ' 出庫処理が完了しました。';
            }
          } else {
            // 文字列 "0" のみ到達する default 分岐(値は変わらないが上書きは行う)
            newInventoryItem = newQuantity;
            message += ' 数量変更はありませんでした。';
          }
        }

        await db
          .update(items)
          .set({
            productName: body.productName,
            modelNumber: body.modelNumber,
            location: body.location,
            remarks: body.remarks ?? null,
            ...(newInventoryItem !== undefined ? { inventoryItem: newInventoryItem } : {}),
            updatedAt: nowTimestamp(),
          })
          .where(eq(items.id, item.id));

        return c.json({ success: true, message });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        return c.json(
          { success: false, message: `アイテムの更新中にエラーが発生しました: ${detail}` },
          500,
        );
      }
    },
  );
