import { useInventoryItemState } from '../hooks/InventoryItems';
import { api } from '../lib/api-client';

/**
 * 行編集トグル + 更新処理(現行 features/EditAndUpdate.tsx の忠実移植)。
 * 編集モード判定は現行同様に色文字列(lightred/lightgreen)、入力値の収集も
 * 現行同様 DOM 直接参照で行う(挙動同一性を優先)。
 * 更新エラーは console.error のみで画面には出ない(現行仕様)。
 */
export const useEditUpdate = (fetchData: () => Promise<void>) => {
  const { btnEditChangeColors, setBtnEditChangeColors } = useInventoryItemState();

  const handleItemsUpdate = async (
    id: number,
    updatedValues: {
      productName: string;
      modelNumber: string;
      location: string;
      quantityChange: number;
      remarks: string;
    },
  ) => {
    try {
      const response = await api.api.items[':id'].$put({
        param: { id: String(id) },
        json: updatedValues,
      });
      const data = await response.json();
      if (!response.ok) {
        // 旧実装は axios が非 2xx で throw するため再取得しない。同挙動を維持する
        console.error('Error update item:', data);
        return;
      }
      console.log('Update success:', data);
      await fetchData();
    } catch (error) {
      console.error('Error update item:', error);
    }
  };

  const handleEditButtonClick = (item: { id: number }) => {
    const isLightRed = btnEditChangeColors[item.id] === 'lightred';
    if (isLightRed) {
      const updatedValues = {
        productName: (document.getElementById(`productName-${item.id}`) as HTMLInputElement).value,
        modelNumber: (document.getElementById(`modelNumber-${item.id}`) as HTMLInputElement).value,
        location: (document.getElementById(`location-${item.id}`) as HTMLInputElement).value,
        remarks: (document.getElementById(`remarks-${item.id}`) as HTMLInputElement).value,
        quantityChange: 0,
      };

      const quantityChangeInput = document.getElementById(
        `quantityChange-${item.id}`,
      ) as HTMLInputElement | null;
      if (quantityChangeInput && quantityChangeInput.value.trim() !== '') {
        updatedValues.quantityChange = Number.parseInt(quantityChangeInput.value, 10);
      }

      handleItemsUpdate(item.id, updatedValues);
    }
    const changeColor = isLightRed ? 'lightgreen' : 'lightred';
    setBtnEditChangeColors((prev) => ({
      ...prev,
      [item.id]: changeColor,
    }));
  };

  return { handleEditButtonClick, handleItemsUpdate, btnEditChangeColors };
};
