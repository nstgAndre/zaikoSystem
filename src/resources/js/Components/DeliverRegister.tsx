import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { InventoryItem } from '../types/inventoryItems';
import { useModalRemark } from '@/features/ModalRemark';

interface DeliverRegisterProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: InventoryItem[]; 
}


const DeliverRegister: React.FC<DeliverRegisterProps> = ({ isOpen, onClose, selectedItems }) => {

    const {
        modalShow,
        selectedRemark,
        openModal, closeModal
    } = useModalRemark();

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="relative overflow-auto max-h-[80vh]">
                <button onClick={onClose} className="absolute right-3 top-3 text-white text-2xl h-8 w-8 flex items-center justify-center bg-transparent  hover:bg-gray-500 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <form>
                <div className="overflow-hidden h shadow-sm sm:rounded-lg">
                            <table className="w-full border-4 border-lightblue bg-deepblue">
                                <thead>
                                    <tr className='text-white grid grid-cols-8 text-white border-b-2 border-lightblue mr-2 ml-2'>
                                        <th className="py-3 px-4 text-center">No</th>
                                        <th className="py-3 px-2 text-center">商品名</th>
                                        <th className="py-3 px-4 text-center">型番</th>
                                        <th className="py-3 px-4 text-center">納品場所</th>
                                        <th className="py-3 px-4 text-center">入庫数量</th>
                                        <th className="py-3 px-4 text-center">出庫数量</th>
                                        <th className="py-3 px-4 text-center">在庫数量</th>
                                        <th className="py-3 px-4 text-center mr-4">備考</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItems.map((item) => (
                                        <tr key={item.id} className=' mt-4 mr-2 ml-2 mb-2 grid grid-cols-8 text-white border-2 border-lightblue rounded-md'>
                                            <td className="py-3 px-4 text-center">{item.id}</td>
                                            <td className="py-3 px-4 text-center">{item.productName}</td>
                                            <td className="py-3 px-4 text-center">{item.modelNumber}</td>
                                            <td className="py-3 px-4 text-center">{item.location}</td>
                                            <td className="py-3 px-4 text-center">{item.inItem}</td>
                                            <td className="py-3 px-4 text-center">{item.outItem}
                                            {/* <input
                                                type="number"
                                                value=
                                                className="w-full text-center"
                                            /> */}
                                            </td>
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
                </form>
            </div>
        </Modal>
    );
};

export default DeliverRegister;