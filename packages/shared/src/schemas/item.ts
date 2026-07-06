import { z } from 'zod';

/**
 * 在庫アイテムのエンティティスキーマ。
 * キー名は現行 Laravel の JSON レスポンスに合わせる(カラム名がそのまま出る:
 * 業務カラムは camelCase、タイムスタンプのみ snake_case)。migration-spec.md §3.1 / §4 参照。
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
