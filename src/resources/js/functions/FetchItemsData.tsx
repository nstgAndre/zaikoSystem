import { useEffect } from "react";
import axios from 'axios';
import { InventoryItem } from '@/types/inventoryItems';
import { useInventoryItemState } from '@/hooks/InventoryItems';

export const useFetchItemsData = () => {

    const {loading, setLoading} = useInventoryItemState();
    const {items, setItems} = useInventoryItemState();;
    const {checkBox, setCheckBox} = useInventoryItemState();
    const {errorMessage, setErrorMessage} = useInventoryItemState();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/items');
                setItems(response.data.data);
                const checkBoxState = response.data.data.reduce((acc: { [key: string]: boolean }, item: InventoryItem) => {
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
    }, []);

    return { items, setItems, checkBox, setCheckBox, loading, errorMessage, setErrorMessage };
};
