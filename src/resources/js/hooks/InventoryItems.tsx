import { useState } from 'react';
import { InventoryItem } from '@/types/inventoryItems';

export const useInventoryItemState = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [checkBox, setCheckBox] = useState<{ [key: string]: boolean }>({});
    const [errorMessage, setErrorMessage] = useState('');
    const [modalShow, setModalShow] = useState(false);
    const [selectedRemark, setSelectedRemark] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 3;
    const [bulkData, setBulkData] = useState('');

    return {
        items, setItems,
        filteredItems, setFilteredItems,
        loading, setLoading,
        searchValue, setSearchValue,
        checkBox, setCheckBox,
        errorMessage, setErrorMessage,
        modalShow, setModalShow,
        selectedRemark, setSelectedRemark,
        currentPage, setCurrentPage,
        pageCount, setPageCount,
        itemsPerPage,
        bulkData, setBulkData
    };
};