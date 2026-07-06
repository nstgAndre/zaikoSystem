import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq, like } from 'drizzle-orm';
import { app } from '../app';
import { db } from '../db';
import * as authSchema from '../db/auth-schema';
import { items, stockIns, stockOuts } from '../db/schema';

const TEST_EMAIL = 'items-test@example.com';
const TEST_PASSWORD = 'password-for-items-1234';
const MARK = 'TEST-PR4-';

let cookie = '';
let itemId = 0;

const cleanup = async () => {
  const rows = await db
    .select()
    .from(items)
    .where(like(items.productName, `${MARK}%`));
  for (const row of rows) {
    await db.delete(stockIns).where(eq(stockIns.itemId, row.id));
    await db.delete(stockOuts).where(eq(stockOuts.itemId, row.id));
    await db.delete(items).where(eq(items.id, row.id));
  }
};

beforeAll(async () => {
  await db.delete(authSchema.user).where(eq(authSchema.user.email, TEST_EMAIL));
  const seedAuth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET ?? 'dev-only-secret-zaiko-system',
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    basePath: '/api/auth',
    database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
    emailAndPassword: { enabled: true },
  });
  await seedAuth.api.signUpEmail({
    body: { email: TEST_EMAIL, password: TEST_PASSWORD, name: 'items test' },
  });
  const res = await app.request('/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  cookie = res.headers.get('set-cookie') ?? '';

  await cleanup();
  const [inserted] = await db
    .insert(items)
    .values({
      productName: `${MARK}商品`,
      modelNumber: 'PR4-MODEL',
      location: 'PR4-倉庫',
      inventoryItem: 10,
      quantityChange: 0,
      remarks: 'PR4 テスト',
      createdAt: '2026-01-01 00:00:00',
      updatedAt: '2026-01-01 00:00:00',
    })
    .returning({ id: items.id });
  if (!inserted) throw new Error('failed to insert test item');
  itemId = inserted.id;
});

afterAll(async () => {
  await cleanup();
});

const putItem = (id: number | string, body: Record<string, unknown>) =>
  app.request(`/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });

const baseBody = () => ({
  productName: `${MARK}商品`,
  modelNumber: 'PR4-MODEL',
  location: 'PR4-倉庫',
  quantityChange: 0,
  remarks: 'PR4 テスト',
});

const getInventory = async () => {
  const [row] = await db.select().from(items).where(eq(items.id, itemId));
  return row?.inventoryItem;
};

describe('GET /api/items', () => {
  it('未認証は 401 Unauthenticated.', async () => {
    const res = await app.request('/api/items');
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: 'Unauthenticated.' });
  });

  it('Laravel paginate 互換の形を返す(per_page 省略時 100)', async () => {
    const res = await app.request('/api/items', { headers: { cookie } });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      current_page: number;
      data: Array<Record<string, unknown>>;
      last_page: number;
      per_page: number;
      total: number;
    };
    expect(body.current_page).toBe(1);
    expect(body.per_page).toBe(100);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(1);

    const testItem = body.data.find((d) => d.productName === `${MARK}商品`);
    expect(testItem).toBeDefined();
    expect(testItem?.created_at).toBe('2026-01-01T00:00:00.000000Z');
    expect(testItem?.inventoryItem).toBe(10);
  });

  it('per_page 指定でページングされる', async () => {
    const res = await app.request('/api/items?per_page=1', { headers: { cookie } });
    const body = (await res.json()) as { data: unknown[]; per_page: number; last_page: number };
    expect(body.data.length).toBe(1);
    expect(body.per_page).toBe(1);
    expect(body.last_page).toBeGreaterThanOrEqual(1);
  });
});

describe('PUT /api/items/:id', () => {
  it('quantityChange 数値 0 は編集のみ(入出庫レコードなし)', async () => {
    const res = await putItem(itemId, { ...baseBody(), location: 'PR4-倉庫B' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'アイテムが正常に更新されました。',
    });

    const [row] = await db.select().from(items).where(eq(items.id, itemId));
    expect(row?.location).toBe('PR4-倉庫B');
    expect(row?.inventoryItem).toBe(10);
    const ins = await db.select().from(stockIns).where(eq(stockIns.itemId, itemId));
    expect(ins.length).toBe(0);
  });

  // 入出庫量は stock_ins.inItem / stock_outs.outItem の DB 全体 UNIQUE 制約と
  // 実運用値が衝突しないよう、現実に出現しにくい希少値を使う
  it('正の quantityChange は入庫: stock_ins 追加 + 在庫加算', async () => {
    const res = await putItem(itemId, { ...baseBody(), quantityChange: 9991 });
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe('アイテムが正常に更新されました。 入庫処理が完了しました。');
    expect(await getInventory()).toBe(10001);
    const ins = await db.select().from(stockIns).where(eq(stockIns.itemId, itemId));
    expect(ins.length).toBe(1);
    expect(ins[0]?.inItem).toBe(9991);
  });

  it('負の quantityChange は出庫: stock_outs 追加 + 在庫減算', async () => {
    const res = await putItem(itemId, { ...baseBody(), quantityChange: -9993 });
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe('アイテムが正常に更新されました。 出庫処理が完了しました。');
    expect(await getInventory()).toBe(8);
    const outs = await db.select().from(stockOuts).where(eq(stockOuts.itemId, itemId));
    expect(outs.length).toBe(1);
    expect(outs[0]?.outItem).toBe(9993);
  });

  it('在庫不足の出庫は 200 のまま失敗メッセージ連結・在庫不変・編集は保存(現行仕様)', async () => {
    const res = await putItem(itemId, {
      ...baseBody(),
      location: 'PR4-倉庫C',
      quantityChange: -999,
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; message: string };
    expect(body.success).toBe(true);
    expect(body.message).toBe(
      'アイテムが正常に更新されました。 在庫数量の更新に失敗しました: エラー: 在庫不足のため出庫できません。',
    );
    expect(await getInventory()).toBe(8);
    const [row] = await db.select().from(items).where(eq(items.id, itemId));
    expect(row?.location).toBe('PR4-倉庫C');
    const outs = await db.select().from(stockOuts).where(eq(stockOuts.itemId, itemId));
    expect(outs.length).toBe(1);
  });

  it('文字列 "0" は default 分岐(数量変更なしメッセージ・現行仕様)', async () => {
    const res = await putItem(itemId, { ...baseBody(), quantityChange: '0' });
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe('アイテムが正常に更新されました。 数量変更はありませんでした。');
    expect(await getInventory()).toBe(8);
  });

  it('存在しない id は 404 ではなく 500(現行仕様)', async () => {
    const res = await putItem(9999999, baseBody());
    expect(res.status).toBe(500);
    const body = (await res.json()) as { success: boolean; message: string };
    expect(body.success).toBe(false);
    expect(body.message).toStartWith('アイテムの更新中にエラーが発生しました: ');
  });

  it('productName 空文字は 422(ConvertEmptyStringsToNull + required の再現)', async () => {
    const res = await putItem(itemId, { ...baseBody(), productName: '' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/items/bulk', () => {
  it('文字列 inventoryItem のまま登録され stock_ins には記録されない(現行仕様)', async () => {
    const res = await app.request('/api/items/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({
        items: [
          {
            productName: `${MARK}バルク`,
            modelNumber: 'BULK-1',
            location: 'バルク倉庫',
            inventoryItem: '77',
            remarks: 'カンマ入力',
          },
        ],
      }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: 'アイテムが正常に登録されました。' });

    const [row] = await db
      .select()
      .from(items)
      .where(eq(items.productName, `${MARK}バルク`));
    expect(row?.inventoryItem).toBe(77);
    if (!row) throw new Error('bulk row not created');
    const ins = await db.select().from(stockIns).where(eq(stockIns.itemId, row.id));
    expect(ins.length).toBe(0);
  });
});

describe('POST /api/items/csv', () => {
  it('BOM 付き・laracsv 互換ヘッダ・選択行のみの CSV を返す', async () => {
    const res = await app.request('/api/items/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ ids: [String(itemId)], fileName: '202607_棚卸し.csv' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    const encoded = encodeURIComponent('202607_棚卸し.csv');
    expect(res.headers.get('content-disposition')).toBe(
      `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
    );

    const text = await res.text();
    expect(text.startsWith('﻿')).toBe(true);
    const lines = text.slice(1).trimEnd().split('\n');
    expect(lines[0]).toBe('ID,商品名,型番,場所,在庫数,備考,登録日');
    expect(lines.length).toBe(2);
    expect(lines[1]).toBe(
      `${itemId},${MARK}商品,PR4-MODEL,PR4-倉庫,8,PR4 テスト,2026-01-01 00:00:00`,
    );
  });

  it('ids 空はヘッダのみの CSV(現行仕様)', async () => {
    const res = await app.request('/api/items/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ fileName: 'empty.csv' }),
    });

    const text = await res.text();
    expect(text).toBe('﻿ID,商品名,型番,場所,在庫数,備考,登録日\n');
  });

  it('カンマを含む備考はクオートされる', async () => {
    const [inserted] = await db
      .insert(items)
      .values({
        productName: `${MARK}カンマ`,
        modelNumber: 'C-1',
        location: 'L-1',
        inventoryItem: 1,
        quantityChange: 0,
        remarks: 'a,b "q"',
        createdAt: '2026-01-02 03:04:05',
        updatedAt: '2026-01-02 03:04:05',
      })
      .returning({ id: items.id });
    if (!inserted) throw new Error('failed to insert');

    const res = await app.request('/api/items/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ ids: [inserted.id], fileName: 'q.csv' }),
    });
    const text = await res.text();
    expect(text).toContain('"a,b ""q"""');
    expect(text).toContain('2026-01-02 03:04:05');
  });
});
