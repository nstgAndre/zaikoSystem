import {
  bigint,
  bigserial,
  date,
  foreignKey,
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';

// drizzle-kit pull で既存 PostgreSQL(Laravel が作成)から取り込んだ業務テーブル定義。
// スキーマは移植期間中は変更しない(migration-spec.md §1.3)。
// id 列は DB 上 bigint だが値域は安全整数内のため mode: 'number' で扱う
// (mode: 'bigint' だと JSON シリアライズできない)。

export const items = pgTable('items', {
  id: bigserial({ mode: 'number' }).primaryKey().notNull(),
  productName: varchar({ length: 255 }).notNull(),
  modelNumber: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  inventoryItem: integer().notNull(),
  quantityChange: integer().default(0).notNull(),
  remarks: varchar({ length: 255 }),
  createdAt: timestamp('created_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
});

export const stockIns = pgTable(
  'stock_ins',
  {
    id: bigserial({ mode: 'number' }).primaryKey().notNull(),
    itemId: integer('item_id').notNull(),
    inItem: integer().notNull(),
    registrationDate: date('registration_date'),
    createdAt: timestamp('created_at', { mode: 'string' }),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
  },
  (table) => [unique('stock_ins_initem_unique').on(table.inItem)],
);

export const stockOuts = pgTable(
  'stock_outs',
  {
    id: bigserial({ mode: 'number' }).primaryKey().notNull(),
    itemId: integer('item_id').notNull(),
    outItem: integer().notNull(),
    registrationDate: date('registration_date'),
    createdAt: timestamp('created_at', { mode: 'string' }),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
  },
  (table) => [unique('stock_outs_outitem_unique').on(table.outItem)],
);

export const logs = pgTable(
  'logs',
  {
    id: bigserial({ mode: 'number' }).primaryKey().notNull(),
    itemId: bigint('item_id', { mode: 'number' }).notNull(),
    inventoryItem: integer(),
    stockInId: bigint('stock_in_id', { mode: 'number' }),
    stockOutId: bigint('stock_out_id', { mode: 'number' }),
    inItem: integer('in_item'),
    outItem: integer('out_item'),
    remarks: varchar({ length: 255 }),
    createdAt: timestamp('created_at', { mode: 'string' }),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
  },
  (table) => [
    foreignKey({
      columns: [table.itemId],
      foreignColumns: [items.id],
      name: 'logs_item_id_foreign',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.stockInId],
      foreignColumns: [stockIns.id],
      name: 'logs_stock_in_id_foreign',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.stockOutId],
      foreignColumns: [stockOuts.id],
      name: 'logs_stock_out_id_foreign',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.inItem],
      foreignColumns: [stockIns.inItem],
      name: 'logs_in_item_foreign',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.outItem],
      foreignColumns: [stockOuts.outItem],
      name: 'logs_out_item_foreign',
    }).onDelete('set null'),
  ],
);
