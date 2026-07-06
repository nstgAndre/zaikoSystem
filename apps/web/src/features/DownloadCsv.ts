import type React from 'react';

/**
 * CSV ダウンロード(PR5 で移植予定のスタブ)。
 * 現行 features/DownloadCsv.tsx の POST /api/items/csv 呼び出しは
 * API 側の実装(PR5)と合わせて移植する。
 */
export const useDownloadCsv = (
  _checkBox: { [key: string]: boolean },
  _setCheckBox: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
) => {
  const handleDownloadCsv = () => {
    console.warn('CSV ダウンロードは PR5 で移植予定');
  };
  return { handleDownloadCsv };
};
