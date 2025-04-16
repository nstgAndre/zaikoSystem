import axios from 'axios';
import { useInventoryItemState } from '@/hooks/InventoryItems';

export const useDownloadCsv = (checkBox: { [key: string]: boolean }, setCheckBox: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>) => {
    const {errorMessage, setErrorMessage} = useInventoryItemState();
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const csvFileName=`${yearMonth}_棚卸し.csv`;

    const handleDownloadCsv = async () => {
        try {
            const selectedIds = Object.keys(checkBox).filter(key => checkBox[key]);
            if (selectedIds.length === 0) {
                setErrorMessage('エラー: 選択されたアイテムがありません。');
                return;
            }
            const response = await axios({
                url: '/api/items/csv',
                method: 'POST',
                responseType: 'blob',
                data: { ids: selectedIds, fileName: csvFileName  },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${csvFileName}`);
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            setErrorMessage('');
        } catch (error) {
            console.error('Error downloading the CSV file:', error);
            setErrorMessage('ダウンロード中に未知のエラーが発生しました。');
        }
    };

    return { errorMessage, handleDownloadCsv };
};