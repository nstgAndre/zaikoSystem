import { Head } from '@inertiajs/react';
import { ThreeDots as Loader } from 'react-loader-spinner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import { PageProps } from '@/types';
import Modal from '@/Components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faPen, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { useInventoryItemState } from '@/hooks/InventoryItems';
import { useFetchItemsData } from '@/functions/FetchItemsData';
import { useModalRemark } from '@/features/ModalRemark';
import { useDownloadCsv } from '@/features/DownloadCsv';
import { usePagenateSearchFilter } from '@/features/PagenateSearchFilter';
import { useMasterCheckbox } from '@/features/MasterCheckbox';
import StorageRegister from '@/Pages/Layouts/StorageRegister';
import { useEditUpdate } from '@/features/EditAndUpdate';

export default function InventoryDashboard({ auth }: PageProps) {
    // 入庫記録モーダルの状態管理
    const {
        showRegisterModal,
        setShowRegisterModal,
        searchValue,
        setSearchValue,
    } = useInventoryItemState();

    const {
        items=[],
        loading,
        checkBox,
        setCheckBox,
        fetchData
    } = useFetchItemsData();

    const {
        modalShow,
        selectedRemark,
        openModal, closeModal
    } = useModalRemark();

    const {
        handleDownloadCsv,
    } = useDownloadCsv(checkBox, setCheckBox);

    const {
        currentPage,
        pageCount,
        itemsDisplayed, handlePageClick
    } = usePagenateSearchFilter({ items, searchValue });

    const {
        handleEditButtonClick,btnEditChangeColors
    } = useEditUpdate(fetchData);

    const { handleMasterCheckboxChange } = useMasterCheckbox(checkBox, setCheckBox)

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
                        <div>
                            <div className="flex justify-end space-x-4">
                                <DangerButton onClick={() => setShowRegisterModal(true)} className="text-white border-2 !bg-deepblue !border-lightblue rounded-md mb-2 !focus:ring-blue-500">
                                    入庫記録
                                </DangerButton>
                                <DangerButton onClick={() => handleDownloadCsv()} className="text-white border-2 !bg-deepblue !border-lightblue rounded-md mb-2 !focus:ring-blue-500">
                   
                                    CSVダウンロード
                                </DangerButton>
                            </div>
                            <StorageRegister isOpen={showRegisterModal} onClose={() => { setShowRegisterModal(false); fetchData(); }} fetchData={fetchData} />
                        </div>

                        <div className="overflow-hidden shadow-sm sm:rounded-lg">
                            <table className="w-full border-4 border-lightblue bg-deepblue">
                                <thead>
                                    <tr className={`text-white ${Object.values(btnEditChangeColors).includes('lightred') ? 'grid grid-cols-8' : 'grid grid-cols-7'} text-white border-b-2 border-lightblue mr-2 ml-2`}>
                                        <th className='py-3 pl-1 text-center'>
                                            <input
                                                type='checkbox'
                                                className='border-lightblue bg-deepblue'
                                                onChange={handleMasterCheckboxChange}
                                            />
                                        </th>
                                        <th className="py-3 px-4 text-center">商品名</th>
                                        <th className="py-3 px-4 text-center">型番</th>
                                        <th className="py-3 px-4 text-center">納品場所</th>
                                        {Object.values(btnEditChangeColors).includes('lightred') && (
                                            <th className="py-3 px-4 text-center">数量変更</th>
                                        )}
                                        <th className="py-3 px-4 text-center">在庫数量</th>
                                        <th className="py-3 px-4 text-center">備考</th>
                                        <th className="py-3 px-4 text-center">編集</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsDisplayed.map((item) => (
                                        <tr key={item.id} className={`mt-4 mr-2 ml-2 mb-2 text-white border-2 border-lightblue rounded-md ${btnEditChangeColors[item.id] === 'lightred' ? 'grid grid-cols-8' : 'grid grid-cols-7'}`}>
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
                                            <td className="py-3 px-4 text-center">
                                                {btnEditChangeColors[item.id] === 'lightred' ? (
                                                    <input id={`productName-${item.id}`} type="text" defaultValue={item.productName} className="w-full text-center bg-deepblue" />
                                                ) : (
                                                    item.productName
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {btnEditChangeColors[item.id] === 'lightred' ? (
                                                    <input id={`modelNumber-${item.id}`} type="text" defaultValue={item.modelNumber} className="w-full text-center bg-deepblue" />
                                                ) : (
                                                    item.modelNumber
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {btnEditChangeColors[item.id] === 'lightred' ? (
                                                    <input id={`location-${item.id}`} type="text" defaultValue={item.location} className="w-full text-center bg-deepblue" />
                                                ) : (
                                                    item.location
                                                )}
                                            </td>
                                            {btnEditChangeColors[item.id] === 'lightred' && (
                                                <td className="py-3 px-4 text-center">
                                                    <input type="text" inputMode="numeric" className="w-full text-center bg-deepblue" />
                                                </td>
                                            )}
                                            <td className="py-3 px-4 text-center">{item.inventoryItem}</td>
                                            <td className="py-3 px-4 text-center">
                                                {btnEditChangeColors[item.id] === 'lightred' ? (
                                                    <input id={`remarks-${item.id}`} type="text" defaultValue={item.remarks} className="w-full text-center bg-deepblue" />
                                                ) : (
                                                    <DangerButton onClick={() => openModal(item.remarks)} className="text-white !bg-gold">
                                                        詳細
                                                    </DangerButton>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center ">
                                                    <DangerButton
                                                        bgColor={btnEditChangeColors[item.id] === 'lightred' ? 'bg-lightred' : 'bg-lightgreen'}
                                                        onClick={() => handleEditButtonClick(item)}
                                                    >
                                                        <FontAwesomeIcon icon={btnEditChangeColors[item.id] === 'lightred' ? faArrowsRotate : faPen} />
                                                    </DangerButton>
                                                </div>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" strokeWidth="2" width="24" height="24">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
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
            </div>
        </AuthenticatedLayout>
    );
};