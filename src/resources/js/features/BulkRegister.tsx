import axios from 'axios';
import { useInventoryItemState } from '@/hooks/InventoryItems';
import React from "react";

export const useBulkData = () => {
// interface BulkAddResponse {
//     success: boolean;
//     message: string;
// }

    const {bulkData, setBulkData} = useInventoryItemState();
    const {successMessage, setSuccessMessage} = useInventoryItemState();

    const bulkHandleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const items = bulkData.split('\n').map(item => {
                const [productName, modelNumber, location, inItem, remarks] = item.split(',').map(part => part.trim());
                return { productName, modelNumber, location, inItem: parseInt(inItem), remarks };  //APIのリクエストに返す
            });
            const response = await axios.post('/api/items/bulk', { items });
            setSuccessMessage(response.data.success);
        } catch (error) {
            console.error('Error posting bulk items:', error);
        }
    };
    return { bulkData, setBulkData, bulkHandleSubmit, successMessage};
};
