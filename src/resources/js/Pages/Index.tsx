import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ThreeDots as Loader } from 'react-loader-spinner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import { PageProps } from '@/types';
import Modal from '@/Components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';

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
    const [Loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [checkBox, setCheckBox] = useState<boolean[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [modalShow, setModalShow] = useState(false);
    const [selectedRemark, setSelectedRemark] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const itemsPerPage = 3; //表示件数

    // モーダルを開く関数
    const openModal = (remark: string) => {
        setSelectedRemark(remark);
        setModalShow(true);
    };

    // モーダルを閉じる関数
    const closeModal = () => {
        setModalShow(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/items?page=${currentPage + 1}&per_page=${itemsPerPage}`);
                setItems(prevItems => [...prevItems, ...response.data.data]);
                setPageCount(response.data.last_page);
                setCheckBox(new Array(response.data.data.length).fill(false));
            } catch (error) {
                console.error('Error fetching items:', error);
                setErrorMessage('アイテムの取得中にエラーが発生しました。');
            }
            setLoading(false);
        };

        fetchData();

        //ブラウザ戻る防止
        window.history.pushState(null, document.title, window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, document.title, window.location.href);
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [currentPage]);

    const handleDownloadCsv = async () => {
        try {
            const selectedIds = items.filter((_, index) => checkBox[index]).map(item => item.id);
            if (selectedIds.length === 0 || selectedIds.some(id => typeof id !== 'number')) {
                setErrorMessage('エラー: 選択されたアイテムがありません。');
                return;
            }
            const response = await axios({
                url: '/api/items/csv',
                method: 'POST',
                responseType: 'blob',
                data: { ids: selectedIds },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'items.csv');
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) {
                link.parentNode.removeChild(link);
            }
            setErrorMessage('');
        } catch (error) {
            console.error('Error downloading the CSV file:', error);
            const typedError = error as { response?: { data?: { error?: string } } };
            if (typedError.response && typedError.response.data && typedError.response.data.error) {
                setErrorMessage(typedError.response.data.error);
            } else {
                setErrorMessage('ダウンロード中に未知のエラーが発生しました。');
            }
        }
    };

    const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCheckBox(new Array(checkBox.length).fill(e.target.checked));
    };

    const normalizeSearchString = (str: string) => {
        if (!str) return "";
        return str.normalize("NFC").toUpperCase()
            .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    };

    useEffect(() => {
        const normalizedSearchValue = normalizeSearchString(searchValue);
        const filtered = items.filter(item =>
            normalizeSearchString(item.productName).includes(normalizedSearchValue) ||
            normalizeSearchString(item.modelNumber).includes(normalizedSearchValue) ||
            normalizeSearchString(item.location).includes(normalizedSearchValue) ||
            normalizeSearchString(item.remarks).includes(normalizedSearchValue)
        );
        setFilteredItems(filtered);
    }, [searchValue, items]);

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const itemsDisplayed = filteredItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl pb-1 text-white leading-tight text-left">在庫管理一覧</h2>}
        >
            <Head title="在庫管理システム" />
            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="flex items-center w-full mb-4 relative">
                    <input
                        id="search"
                        className="w-full pl-4 pr-4 py-2 rounded-lg"
                        type="text"
                        placeholder="検索する文字を入力してください"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faFilter} className='absolute right-3' />
                </div>

                {Loading ? (
                    <>
                        <div className="flex justify-center items-center">
                            <Loader color="#00BFFF" height={80} width={80} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-end">
                            <DangerButton onClick={handleDownloadCsv} className="text-white border-2 !bg-deepblue !border-lightblue rounded-md mb-2 !focus:ring-blue-500">
                                CSVダウンロード
                            </DangerButton>
                        </div>

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
                                    {itemsDisplayed.map((item, index) => (
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
                                            <td className="py-3 px-4 text-center">
                                                <DangerButton onClick={() => openModal(item.remarks)} className="text-white !bg-gold">
                                                    詳細
                                                </ DangerButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <Modal show={modalShow} onClose={closeModal}>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">備考詳細</h3>
                                    <p>{selectedRemark}</p>
                                    <button
                                        onClick={closeModal}
                                        className="absolute top-0 right-0 p-2 text-lg font-bold"
                                        aria-label="Close"
                                    >
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                            </Modal>
                        </div>
                    </>
                )}
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => handlePageClick(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-3 py-1 mx-1 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        &lt;
                    </button>
                    {Array.from({ length: pageCount }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageClick(index)}
                            className={`px-3 py-1 mx-1 ${index === currentPage ? 'bg-blue-700' : 'bg-blue-500'} text-white rounded`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageClick(currentPage + 1)}
                        disabled={currentPage === pageCount - 1}
                        className="px-3 py-1 mx-1 bg-blue-500 text-white rounded disabled:opacity-50"
                    >
                        &gt;
                    </button>
                </div>
                <div className="p-6 text-white border-2 border-blue-500 p-4 mt-4 rounded">
                    リアルタイム通知履歴
                    {errorMessage && (
                        <div className="mt-2 text-red-500">
                            {errorMessage}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};