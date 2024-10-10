import { useInventoryItemState } from '@/hooks/InventoryItems';
import { useState } from 'react';

export const useModalRemark = () => {
    const {modalShow, setModalShow} = useInventoryItemState();
    const {selectedRemark, setSelectedRemark} = useInventoryItemState();

    const openModal = (remark: string) => {
        setSelectedRemark(remark);
        setModalShow(true);
    };

    const closeModal = () => {
        setModalShow(false);
    };

    return {
        modalShow,
        setModalShow,
        selectedRemark,
        setSelectedRemark,
        openModal,
        closeModal
    };
};
