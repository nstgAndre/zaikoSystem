import type React from 'react';
import { useInventoryItemState } from '../hooks/InventoryItems';
import { api } from '../lib/api-client';

/**
 * 一括入庫登録(現行 features/BulkRegister.tsx の忠実移植)。
 * 改行分割ロジックはコード上残るが、入力欄が単一行 input のため UI からは常に
 * 1 件のみ送信される(migration-spec.md §2.3)。inventoryItem は文字列のまま送る。
 */
export const useBulkData = () => {
  const { bulkData, setBulkData } = useInventoryItemState();
  const { successMessage, setSuccessMessage } = useInventoryItemState();

  const bulkHandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const bulkItems = bulkData.split('\n').map((line) => {
        const [productName, modelNumber, location, inventoryItem, remarks] = line
          .split(',')
          .map((part) => part.trim());
        return { productName, modelNumber, location, inventoryItem, remarks };
      });
      const response = await api.api.items.bulk.$post({
        json: { items: bulkItems },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
      const data = (await response.json()) as { success: string };
      setSuccessMessage(data.success);
    } catch (error) {
      console.error('Error posting bulk items:', error);
    }
  };
  return { bulkData, setBulkData, bulkHandleSubmit, successMessage };
};
