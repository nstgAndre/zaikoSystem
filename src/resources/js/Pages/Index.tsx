import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface InventoryItem {
    id: number;
    productName: string;
    modelNumber: string;
    location: string;
    inItem: number;
    outItem: number;
    inventoryItem: number;
    remarks: string;
}

export default function InventoryDashboard({ auth }: PageProps) {
    const [items, setItems] = useState<InventoryItem[]>([]);
    useEffect(() => {
        axios.get('/api/items')
            .then(response => {
                setItems(response.data.items);
            })
            .catch(error => console.error('Error fetching items:', error));
    }, []);
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
                                    <th>納品場所</th>
                                    <th>入庫数量</th>
                                    <th>出庫数量</th>
                                    <th>在庫数量</th>
                                    <th>備考</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td className="text-center">{item.id}</td>
                                        <td className="text-center">{item.productName}</td>
                                        <td className="text-center">{item.modelNumber}</td>
                                        <td className="text-center">{item.location}</td>
                                        <td className="text-center">{item.inItem}</td>
                                        <td className="text-center">{item.outItem}</td>
                                        <td className="text-center">{item.inventoryItem}</td>
                                        <td className="text-center">{item.remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 text-gray-900">
                            リアルタイム通知履歴
                            {/* 多分履歴表示場所 */}
                            <div>2024/4/1 18:00:45 --- 何某が5個の商品を登録しました。</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}