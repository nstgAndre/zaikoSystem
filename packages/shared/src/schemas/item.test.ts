import { describe, expect, it } from 'bun:test';
import { inventoryItemSchema } from './item';

const validItem = {
  id: 1,
  productName: 'テスト商品',
  modelNumber: 'ABC-123',
  location: '倉庫A',
  inventoryItem: 10,
  quantityChange: 0,
  remarks: null,
  created_at: '2024-05-08T05:06:57.000000Z',
  updated_at: null,
};

describe('inventoryItemSchema', () => {
  it('現行 Laravel のレスポンス形を受理する', () => {
    expect(inventoryItemSchema.parse(validItem)).toEqual(validItem);
  });

  it('remarks は文字列も受理する', () => {
    const item = { ...validItem, remarks: '備考テキスト' };
    expect(inventoryItemSchema.parse(item)).toEqual(item);
  });

  it('inventoryItem が文字列なら拒否する', () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, inventoryItem: '10' })).toThrow();
  });

  it('必須キーの欠落を拒否する', () => {
    const { productName: _productName, ...missing } = validItem;
    expect(() => inventoryItemSchema.parse(missing)).toThrow();
  });
});
