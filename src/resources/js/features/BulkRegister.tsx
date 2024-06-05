import { useState } from "react";
import axios from 'axios';
import { useInventoryItemState } from '@/hooks/InventoryItems';


export const useBulkData =() => {
    const {bulkData, setBulkData} = useInventoryItemState();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const items = bulkData.split('、').map(item => item.trim());
        axios.post('/api/items/bulk', { items })
            .then(response => {
                console.log('Success:', response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    return { bulkData, setBulkData, handleSubmit };

}