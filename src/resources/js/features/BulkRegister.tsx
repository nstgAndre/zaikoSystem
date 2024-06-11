import axios from 'axios';
import { useInventoryItemState } from '@/hooks/InventoryItems';

export const useBulkData = () => {
// interface BulkAddResponse {
//     success: boolean;
//     message: string;
// }

    const {bulkData, setBulkData} = useInventoryItemState();
    const {successMessage, setSuccessMessage} = useInventoryItemState();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const items = bulkData.split('\n').map(item => {
                const [productName, modelNumber, location, inItem, remarks] = item.split(',').map(part => part.trim());
                return { productName, modelNumber, location, inItem: parseInt(inItem), remarks };
            });
            const response = await axios.post('/api/items/bulk', { items });
            setSuccessMessage(response.data.success);
        } catch (error) {
            console.error('Error posting bulk items:', error);
        }
    };

    return { bulkData, setBulkData, handleSubmit, successMessage};
};
