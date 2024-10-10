import { useInventoryItemState } from '@/hooks/InventoryItems';
import axios from 'axios';
import type React from "react";


export const useBulkData = () => {
    const {bulkData, setBulkData} = useInventoryItemState();
    const {successMessage, setSuccessMessage} = useInventoryItemState();

    const bulkHandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const items = bulkData.split('\n').map(item => {
                const [productName, modelNumber, location, inventoryItem, remarks] = item.split(',').map(part => part.trim());
                return { productName, modelNumber, location, inventoryItem, remarks };//APIのリクエストに返す
            });
            const response = await axios.post('/api/items/bulk', { items });
            setSuccessMessage(response.data.success);

        } catch (error) {
            console.error('Error posting bulk items:', error);
        }
    };
    return { bulkData, setBulkData, bulkHandleSubmit, successMessage};
};
