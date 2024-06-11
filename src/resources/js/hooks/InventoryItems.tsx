import { useState } from 'react';
import { InventoryItem } from '@/types/inventoryItems';

export const useInventoryItemState = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [checkBox, setCheckBox] = useState<{ [key: string]: boolean }>({});
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [modalShow, setModalShow] = useState(false);
    const [selectedRemark, setSelectedRemark] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 3;
    const [bulkData, setBulkData] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);

    return {
        items, setItems,
        filteredItems, setFilteredItems,
        selectedItems, setSelectedItems,
        loading, setLoading,
        searchValue, setSearchValue,
        checkBox, setCheckBox,
        errorMessage, setErrorMessage,
        successMessage, setSuccessMessage,
        modalShow, setModalShow,
        showRegisterModal, setShowRegisterModal,
        showStockModal, setShowStockModal,
        selectedRemark, setSelectedRemark,
        currentPage, setCurrentPage,
        pageCount, setPageCount,
        itemsPerPage,
        bulkData, setBulkData
    };
};
