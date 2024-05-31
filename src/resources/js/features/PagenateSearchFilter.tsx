import { useEffect, useState } from 'react';
import { InventoryItem } from '@/types/inventoryItems';

interface Props {
    items: InventoryItem[];
    searchValue: string;
}

export const usePagenateSearchFilter = ({ items, searchValue }: Props) => {
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 3;

    const normalizeSearchString = (str: string) => {
        if (!str) return "";
        return str.normalize("NFC").toUpperCase()
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    };

    useEffect(() => {
        const normalizedSearchValue = normalizeSearchString(searchValue);
        const filtered = items.filter(item =>
            normalizeSearchString(item.productName).includes(normalizedSearchValue) ||
            normalizeSearchString(item.modelNumber).includes(normalizedSearchValue) ||
            normalizeSearchString(item.location).includes(normalizedSearchValue) ||
            normalizeSearchString(item.remarks).includes(normalizedSearchValue)
        );
        setFilteredItems(filtered);
        setPageCount(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(0);
    }, [searchValue, items]);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsDisplayed = filteredItems.slice(startIndex, endIndex);

    return { currentPage, pageCount, itemsDisplayed, handlePageClick };
};

export default usePagenateSearchFilter;