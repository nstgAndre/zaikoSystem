import { useState } from 'react';

export const useModalRemark = () => {
    const [modalShow, setModalShow] = useState(false);
    const [selectedRemark, setSelectedRemark] = useState('');

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