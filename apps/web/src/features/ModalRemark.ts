import { useInventoryItemState } from '../hooks/InventoryItems';

/** 備考詳細モーダル(現行 features/ModalRemark.tsx の忠実移植)。 */
export const useModalRemark = () => {
  const { modalShow, setModalShow } = useInventoryItemState();
  const { selectedRemark, setSelectedRemark } = useInventoryItemState();

  const openModal = (remark: string | null) => {
    setSelectedRemark(remark);
    setModalShow(true);
  };

  const closeModal = () => {
    setModalShow(false);
  };

  return { modalShow, selectedRemark, openModal, closeModal };
};
