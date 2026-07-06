import { relations } from 'drizzle-orm/relations';
import { items, logs, stockIns, stockOuts } from './schema';

export const logsRelations = relations(logs, ({ one }) => ({
  item: one(items, {
    fields: [logs.itemId],
    references: [items.id],
  }),
  stockIn_stockInId: one(stockIns, {
    fields: [logs.stockInId],
    references: [stockIns.id],
    relationName: 'logs_stockInId_stockIns_id',
  }),
  stockOut_stockOutId: one(stockOuts, {
    fields: [logs.stockOutId],
    references: [stockOuts.id],
    relationName: 'logs_stockOutId_stockOuts_id',
  }),
  stockIn_inItem: one(stockIns, {
    fields: [logs.inItem],
    references: [stockIns.inItem],
    relationName: 'logs_inItem_stockIns_inItem',
  }),
  stockOut_outItem: one(stockOuts, {
    fields: [logs.outItem],
    references: [stockOuts.outItem],
    relationName: 'logs_outItem_stockOuts_outItem',
  }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  logs: many(logs),
}));

export const stockInsRelations = relations(stockIns, ({ many }) => ({
  logs_stockInId: many(logs, {
    relationName: 'logs_stockInId_stockIns_id',
  }),
  logs_inItem: many(logs, {
    relationName: 'logs_inItem_stockIns_inItem',
  }),
}));

export const stockOutsRelations = relations(stockOuts, ({ many }) => ({
  logs_stockOutId: many(logs, {
    relationName: 'logs_stockOutId_stockOuts_id',
  }),
  logs_outItem: many(logs, {
    relationName: 'logs_outItem_stockOuts_outItem',
  }),
}));
