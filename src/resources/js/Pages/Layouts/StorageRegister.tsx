import Modal from '@/Components/Modal';
import { useBulkData } from '@/features/BulkRegister';
import type React from 'react';
interface StorageRegisterProps {
    isOpen: boolean;
    onClose: () => void;
    fetchData: () => void; 
}

const StorageRegister: React.FC<StorageRegisterProps> = ({ isOpen, onClose, fetchData }) => {
    const { bulkData, setBulkData, bulkHandleSubmit, successMessage } = useBulkData();

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="relative">
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="absolute right-3 top-3 text-white text-2xl h-8 w-8 flex items-center justify-center bg-transparent hover:bg-gray-500 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="24" height="24">
                        <title>閉じる</title>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <form onSubmit={bulkHandleSubmit}>
                    <table className="w-full border-4 border-lightblue bg-deepblue h-auto">
                        <tbody>
                            <tr>
                                <td className="py-3 px-4 flex flex-col items-center justify-center">
                                    <label htmlFor="taskDetail" className="text-red-600 mr-4">
                                        ※商品名,型番,納品場所,入庫数量,備考をカンマ区切りで入力すると一括登録されます。
                                    </label>
                                    <p className="text-white">例:サーバー,DL360,櫻井倉庫,100,代理名</p>
                                    <input
                                        type="text"
                                        value={bulkData}
                                        onChange={(e) => setBulkData(e.target.value)}
                                        placeholder="例:サーバー,DL360,櫻井倉庫,100,代理名"
                                        className="border p-2 w-full mb-8 mt-10"
                                    />
                                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded float-right mb-10 mt-4">
                                        一括登録
                                    </button>
                                    {successMessage &&(
                                        <div className="mt-4 text-green-500">
                                            {successMessage}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        </Modal>
    );
};

export default StorageRegister;
