import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import React from 'react';

interface InventoryItem {
    id: number;
    name: string;
    model: string;
    status: string;
    quantity: number;
    minQuantity: number;
    currentQuantity: number;
    responsible: string;
}

const itemData: InventoryItem[] = [
    { id: 1, name: "サーバー", model: "DL360", status: "稼働中", quantity: 100, minQuantity: 20, currentQuantity: 77, responsible: "OOさん" },
    { id: 2, name: "ルーター", model: "DL360", status: "沈黙", quantity: 76, minQuantity: 10, currentQuantity: 73, responsible: "OOさん" },
    // 他のアイテム...
];

export default function InventoryDashboard({ auth }: PageProps) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">在庫管理</h2>}
        >
            <Head title="Inventory" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>商品名</th>
                                    <th>型番</th>
                                    <th>状態</th>
                                    <th>総量</th>
                                    <th>最小量</th>
                                    <th>現在量</th>
                                    <th>担当者</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemData.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.model}</td>
                                        <td>{item.status}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.minQuantity}</td>
                                        <td>{item.currentQuantity}</td>
                                        <td>{item.responsible}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-6 text-gray-900">
                            リアルタイム通知履歴
                            {/* 多分履歴表示場所 */}
                            <div>2024/4/1 18:00:45 --- 何某が5個の商品を登録しました。</div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}