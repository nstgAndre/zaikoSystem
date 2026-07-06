import { z } from 'zod';

/**
 * 在庫アイテムのエンティティスキーマ。
 * キー名は現行 Laravel の JSON レスポンスに合わせる(カラム名がそのまま出る:
 * 業務カラムは camelCase、タイムスタンプのみ snake_case)。migration-spec.md §3.1 / §4 参照。
 *
 * 注意: Drizzle のクエリ結果はタイムスタンプが createdAt / updatedAt(TS プロパティ名)で
 * 返るため、API レスポンスに変換する際は created_at / updated_at へのキー変換が必須
 * (このスキーマの parse に Drizzle の行をそのまま渡すと失敗する)。
 */
export const inventoryItemSchema = z.object({
  id: z.number().int(),
  productName: z.string().max(255),
  modelNumber: z.string().max(255),
  location: z.string().max(255),
  inventoryItem: z.number().int(),
  quantityChange: z.number().int(),
  remarks: z.string().max(255).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
