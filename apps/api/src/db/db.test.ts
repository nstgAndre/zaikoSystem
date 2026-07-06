import { describe, expect, it } from 'bun:test';
import { db, items } from './index';

// DATABASE_URL の先(ローカル: docker-compose の postgres / CI: service コンテナ)に
// 業務テーブルが存在することが前提。CI では drizzle-kit push で作成する。
describe('db 疎通', () => {
  it('items テーブルを全カラムマッピングで SELECT できる', async () => {
    const rows = await db.select().from(items).limit(1);

    expect(Array.isArray(rows)).toBe(true);
    const first = rows[0];
    if (first) {
      expect(typeof first.id).toBe('number');
      expect(typeof first.productName).toBe('string');
      expect(typeof first.inventoryItem).toBe('number');
    }
  });
});
