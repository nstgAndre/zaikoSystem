import { useInventoryItemState } from '@/hooks/InventoryItems';
import type { InventoryItem } from '@/types/inventoryItems';
import {useCallback, useEffect} from 'react';

interface Props {
    items: InventoryItem[];
    searchValue: string;
}

export const usePagenateSearchFilter = ({ items, searchValue }: Props) => {
    const {filteredItems, setFilteredItems} = useInventoryItemState();
    const {currentPage, setCurrentPage} = useInventoryItemState();
    const {pageCount, setPageCount} = useInventoryItemState();
    const {itemsPerPage} = useInventoryItemState();

    const normalizeSearchString = useCallback((str: string) => {
        if (!str) return "";
        return str.normalize("NFC").toUpperCase()
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    }, []);

    useEffect(() => {
        if (!Array.isArray(items)) return;

        const normalizedSearchValue = normalizeSearchString(searchValue);

        // 検索値に基づくフィルタリング
        const filtered = items.filter(item =>
            normalizeSearchString(item.productName).includes(normalizedSearchValue) ||
            normalizeSearchString(item.modelNumber).includes(normalizedSearchValue) ||
            normalizeSearchString(item.location).includes(normalizedSearchValue) ||
            normalizeSearchString(item.remarks).includes(normalizedSearchValue)
        );

        // 降順に並び替え
        filtered.sort((a, b) => b.id - a.id);

        // 状態更新
        setFilteredItems(filtered);
        setPageCount(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(0);

    }, [searchValue, items, itemsPerPage, normalizeSearchString, setFilteredItems]);


    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsDisplayed = filteredItems.slice(startIndex, endIndex);

    return { currentPage, pageCount, itemsDisplayed, handlePageClick };
};
