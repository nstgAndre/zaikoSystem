import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { useBulkData } from '@/features/BulkRegister';
import Modal from '@/Components/Modal';

export default function InventoryDashboard({ auth }: PageProps) {
    const { bulkData, setBulkData, handleSubmit } = useBulkData();
    const [showModal, setShowModal] = useState(false); 

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl pb-1 text-white leading-tight text-left mb-12">在庫管理一覧</h2>}
        >
            <Head title="在庫管理システム" />
            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="overflow-hidden shadow-sm sm:rounded-lg">
                    <button onClick={handleOpenModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        データ登録
                    </button>
                    <Modal show={showModal} onClose={handleCloseModal}>
                        <div className="relative">
                            <button onClick={handleCloseModal} className="absolute top-0 right-0 p-2 text-white text-3xl">
                                ×
                            </button>
                            <form onSubmit={handleSubmit}>
                                <table className="w-full border-4 border-lightblue bg-deepblue h-auto">
                                    <tbody>
                                        <tr>
                                            <td className="py-3 px-4 flex flex-col items-center justify-center">
                                                <input
                                                    type="text"
                                                    value={bulkData}
                                                    onChange={(e) => setBulkData(e.target.value)}
                                                    placeholder="データをカンマで区切って入力"
                                                    className="border p-2 w-full mb-8"
                                                />
                                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded float-right mb-20">
                                                    一括登録
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </Modal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};