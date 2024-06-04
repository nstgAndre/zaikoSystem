import { useEffect, useState } from "react";
import axios from 'axios';
// import { Inertia } from '@inertiajs/inertia';

interface BulkAddResponse {
    success: boolean;
    message: string;
}

export const useBulkData =() => {
    const [bulkData, setBulkData] = useState('');

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