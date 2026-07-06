import type { InventoryItem } from '@zaiko/shared';
import { useCallback, useEffect } from 'react';
import { useInventoryItemState } from '../hooks/InventoryItems';

interface Props {
  items: InventoryItem[];
  searchValue: string;
}

/**
 * 検索フィルタ + クライアントサイドページネーション
 * (現行 features/PagenateSearchFilter.tsx の忠実移植)。
 * 正規化: NFC → 大文字化 → 全角英数字の半角化。4フィールド OR 部分一致、id 降順、
 * 1 ページ 3 件固定、検索のたびに 1 ページ目へリセット。
 */
export const usePagenateSearchFilter = ({ items, searchValue }: Props) => {
  const { filteredItems, setFilteredItems } = useInventoryItemState();
  const { currentPage, setCurrentPage } = useInventoryItemState();
  const { pageCount, setPageCount } = useInventoryItemState();
  const { itemsPerPage } = useInventoryItemState();

  const normalizeSearchString = useCallback((str: string | null) => {
    if (!str) return '';
    return str
      .normalize('NFC')
      .toUpperCase()
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  }, []);

  useEffect(() => {
    if (!Array.isArray(items)) return;

    const normalizedSearchValue = normalizeSearchString(searchValue);
    const filtered = items.filter(
      (item) =>
        normalizeSearchString(item.productName).includes(normalizedSearchValue) ||
        normalizeSearchString(item.modelNumber).includes(normalizedSearchValue) ||
        normalizeSearchString(item.location).includes(normalizedSearchValue) ||
        normalizeSearchString(item.remarks).includes(normalizedSearchValue),
    );

    filtered.sort((a, b) => b.id - a.id);

    setFilteredItems(filtered);
    setPageCount(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  }, [
    searchValue,
    items,
    itemsPerPage,
    normalizeSearchString,
    setFilteredItems,
    setPageCount,
    setCurrentPage,
  ]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsDisplayed = filteredItems.slice(startIndex, endIndex);

  return { currentPage, pageCount, itemsDisplayed, handlePageClick };
};
