import type { InventoryItem } from '@zaiko/shared';
import { useCallback, useEffect } from 'react';
import { useInventoryItemState } from '../hooks/InventoryItems';
import { api } from '../lib/api-client';

/**
 * 一覧データ取得フック(現行 functions/FetchItemsData.tsx の忠実移植)。
 * パラメータなしで呼ぶため、サーバ既定の per_page=100 により先頭 100 件しか
 * 取得されない(現行仕様)。エラーメッセージは state にセットされるだけで
 * 画面には表示されない(現行仕様、migration-spec.md §1.4 G)。
 */
export const useFetchItemsData = () => {
  const { loading, setLoading, items, setItems, checkBox, setCheckBox, setErrorMessage } =
    useInventoryItemState();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.api.items.$get({ query: {} });
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
      const body = await response.json();
      const data: InventoryItem[] = Array.isArray(body.data) ? body.data : [];
      setItems(data);
      const checkBoxState = data.reduce((acc: { [key: string]: boolean }, item) => {
        acc[item.id] = false;
        return acc;
      }, {});
      setCheckBox(checkBoxState);
    } catch (error) {
      console.error('Error fetching items:', error);
      setErrorMessage('アイテムの取得中にエラーが発生しました。');
    }
    setLoading(false);
  }, [setLoading, setItems, setCheckBox, setErrorMessage]);

  useEffect(() => {
    fetchData();

    // ブラウザ戻る防止(現行仕様)
    window.history.pushState(null, document.title, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, document.title, window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [fetchData]);

  return { items, setItems, checkBox, setCheckBox, loading, fetchData };
};
