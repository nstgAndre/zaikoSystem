import { useInventoryItemState } from '@/hooks/InventoryItems';
import type { InventoryItem } from '@/types/inventoryItems';
import axios from 'axios';
import { useEffect } from "react";

export const useFetchItemsData = () => {
    const {
        loading, setLoading,
        items, setItems,
        checkBox, setCheckBox,
        errorMessage, setErrorMessage
    } = useInventoryItemState();

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/items');
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setItems(data);
            const checkBoxState = data.reduce((acc: { [key: string]: boolean }, item: InventoryItem) => {
                acc[item.id] = false;
                return acc;
            }, {});
            setCheckBox(checkBoxState);
        } catch (error) {
            console.error('Error fetching items:', error);
            setErrorMessage('アイテムの取得中にエラーが発生しました。');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        //ブラウザ戻る防止
        window.history.pushState(null, document.title, window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, document.title, window.location.href);
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [setLoading, setItems, setCheckBox, setErrorMessage]);

    return { items, setItems, checkBox, setCheckBox, loading, errorMessage, setErrorMessage, fetchData };
};
