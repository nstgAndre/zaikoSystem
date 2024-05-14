import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';


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
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [checkBox, setCheckBox] = useState<boolean[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/items');
                setItems(response.data.items);
                setCheckBox(new Array(response.data.items.length).fill(false));
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchData();
    }, []);
    const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckBox(new Array(checkBox.length).fill(e.target.checked));
    };

    const normalizeSearchString = (str: string) => {
        if (!str) return ""; 
        return str.normalize("NFC").toUpperCase()
            .replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60))
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    };

    useEffect (() => {
        const normalizedSearchValue = normalizeSearchString(searchValue);
        const filtered = items.filter(item =>
            normalizeSearchString(item.productName).includes(normalizedSearchValue) ||
            normalizeSearchString(item.modelNumber).includes(normalizedSearchValue) ||
            normalizeSearchString(item.location).includes(normalizedSearchValue) ||
            normalizeSearchString(item.remarks).includes(normalizedSearchValue)
        );
        setFilteredItems(filtered);
    }, [searchValue, items]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl pb-1 text-white leading-tight text-left">在庫管理一覧</h2>}
        >
            <Head title="在庫管理システム" />
            <div className="mx-auto sm:px-6 lg:px-8">
                <input
                    id="search"
                    className="w-full mb-4 rounded-lg"
                    type="text"
                    placeholder="検索する文字を入力してください"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                />
                <div className="overflow-hidden shadow-sm sm:rounded-lg">
                    <table className="w-full border-4 border-lightblue bg-deepblue">
                        <thead>
                            <tr className='text-white grid grid-cols-9 text-white border-b-2 border-lightblue mr-2 ml-2'>
                            <th className='py-3 pl-1 text-center'>
                                <input
                                    type='checkbox'
                                    className='border-lightblue bg-deepblue'
                                    onChange={handleMasterCheckboxChange}
                                />
                            </th>
                                <th className="py-3 px-4 text-center">No</th>
                                <th className="py-3 px-4 text-center">商品名</th>
                                <th className="py-3 px-4 text-center">型番</th>
                                <th className="py-3 px-4 text-center">納品場所</th>
                                <th className="py-3 px-4 text-center">入庫数量</th>
                                <th className="py-3 px-4 text-center">出庫数量</th>
                                <th className="py-3 px-4 text-center">在庫数量</th>
                                <th className="py-3 px-4 text-center">備考</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, index) => (
                                <tr key={item.id} className=' mt-4 mr-2 ml-2 mb-2 grid grid-cols-9 text-white border-2 border-lightblue rounded-md'>
                                    <td className='py-3 text-center'>
                                        <input
                                            type='checkbox'
                                            className='border-lightblue bg-deepblue'
                                            checked={checkBox[index]}
                                            onChange={() => {
                                                const newCheckBox = [...checkBox];
                                                newCheckBox[index] = !newCheckBox[index];
                                                setCheckBox(newCheckBox);
                                            }}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-center">{item.id}</td>
                                    <td className="py-3 px-4 text-center">{item.productName}</td>
                                    <td className="py-3 px-4 text-center">{item.modelNumber}</td>
                                    <td className="py-3 px-4 text-center">{item.location}</td>
                                    <td className="py-3 px-4 text-center">{item.inItem}</td>
                                    <td className="py-3 px-4 text-center">{item.outItem}</td>
                                    <td className="py-3 px-4 text-center">{item.inventoryItem}</td>
                                    <td className="py-3 px-4 text-center">{item.remarks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 text-white">
                        リアルタイム通知履歴
                        {/* 多分履歴表示場所 */}
                        <div>2024/4/1 18:00:45 --- 何某が5個の商品を登録しました。</div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};