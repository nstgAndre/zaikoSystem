import type { InventoryItem } from '@zaiko/shared';
import { useState } from 'react';

/**
 * 在庫画面の状態フック(現行 hooks/InventoryItems.tsx の忠実移植)。
 * 注意: 呼び出しごとに独立した state インスタンスを作る(共有されない)。
 * この特性が現行の「エラーメッセージが画面に出ない」挙動の一因であり、
 * 忠実再現のため意図的に維持している(migration-spec.md §1.4 G)。
 */
export const useInventoryItemState = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [checkBox, setCheckBox] = useState<{ [key: string]: boolean }>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<string | null>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const itemsPerPage = 3;
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [btnEditChangeColors, setBtnEditChangeColors] = useState<{ [key: string]: string }>({});

  return {
    items,
    setItems,
    filteredItems,
    setFilteredItems,
    loading,
    setLoading,
    searchValue,
    setSearchValue,
    checkBox,
    setCheckBox,
    errorMessage,
    setErrorMessage,
    modalShow,
    setModalShow,
    showRegisterModal,
    setShowRegisterModal,
    selectedRemark,
    setSelectedRemark,
    currentPage,
    setCurrentPage,
    pageCount,
    setPageCount,
    itemsPerPage,
    btnEditChangeColors,
    setBtnEditChangeColors,
  };
};
