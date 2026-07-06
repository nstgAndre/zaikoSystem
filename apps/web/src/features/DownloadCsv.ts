import type React from 'react';
import { useInventoryItemState } from '../hooks/InventoryItems';
import { api } from '../lib/api-client';

/**
 * CSV ダウンロード(現行 features/DownloadCsv.tsx の忠実移植)。
 * - ファイル名の年月は UTC 基準(JST では毎月1日 0:00〜8:59 に前月表記 — 現行仕様)
 * - 選択 0 件・失敗時のエラーメッセージは state にセットされるだけで画面には出ない(現行仕様)
 */
export const useDownloadCsv = (
  checkBox: { [key: string]: boolean },
  _setCheckBox: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
) => {
  const { errorMessage, setErrorMessage } = useInventoryItemState();
  const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
  const csvFileName = `${yearMonth}_棚卸し.csv`;

  const handleDownloadCsv = async () => {
    try {
      const selectedIds = Object.keys(checkBox).filter((key) => checkBox[key]);
      if (selectedIds.length === 0) {
        setErrorMessage('エラー: 選択されたアイテムがありません。');
        return;
      }
      const response = await api.api.items.csv.$post({
        json: { ids: selectedIds, fileName: csvFileName },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${csvFileName}`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      setErrorMessage('');
    } catch (error) {
      console.error('Error downloading the CSV file:', error);
      setErrorMessage('ダウンロード中に未知のエラーが発生しました。');
    }
  };

  return { errorMessage, handleDownloadCsv };
};
