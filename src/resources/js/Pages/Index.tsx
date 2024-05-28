import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ThreeDots as Loader } from 'react-loader-spinner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import { PageProps } from '@/types';
import Modal from '@/Components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useInventoryItemState } from '@/hooks/InventoryItems';
import { InventoryItem } from '@/types/inventoryItems';

export default function InventoryDashboard({ auth }: PageProps) {
    const {
        items, setItems,
        filteredItems, setFilteredItems,
        loading, setLoading,
        searchValue, setSearchValue,
        checkBox, setCheckBox,
        errorMessage, setErrorMessage,
        modalShow, setModalShow,
        selectedRemark, setSelectedRemark,
        currentPage, setCurrentPage,
        pageCount, setPageCount,
        itemsPerPage
    } = useInventoryItemState();

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
                const response = await axios.get('/api/items');
                setItems(response.data.data);
                const checkBoxState = response.data.data.reduce((acc: { [key: string]: boolean }, item: InventoryItem) => {
                    acc[item.id] = false;
                    return acc;
                }, {});
                setCheckBox(checkBoxState);
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
    }, []);
    //絞り込み対象文字
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
        setPageCount(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(0);
    }, [searchValue, items, itemsPerPage]);

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
            setErrorMessage('ダウンロード中に未知のエラーが発生しました。');
        }
    };

    const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCheckState = Object.keys(checkBox).reduce((acc, key) => {
            acc[key] = e.target.checked;
            return acc;
        }, {} as { [key: string]: boolean });
        setCheckBox(newCheckState);
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsDisplayed = filteredItems.slice(startIndex, endIndex);

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
                {loading ? (
                    <div className="flex justify-center items-center">
                        <Loader color="#00BFFF" height={80} width={80} />
                    </div>
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
                                                    checked={checkBox[item.id] || false}
                                                    onChange={() => {
                                                        setCheckBox(prev => ({ ...prev, [item.id]: !prev[item.id] }));
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
