import { useEffect } from "react";
import axios from "axios";
import { useInventoryItemState } from "@/hooks/InventoryItems";

export const useEditUpdate = (fetchData: () => Promise<void>) => {
    const { btnEditChangeColors, setGridCols, setBtnEditChangeColors } =useInventoryItemState();


    //編集ボタン処理
    useEffect(() => {
        if (Object.values(btnEditChangeColors).includes("lightred")) {
            setGridCols("grid-cols-8");
        } else {
            setGridCols("grid-cols-7");
        }
    }, [btnEditChangeColors, setGridCols]);

    //編集後データベース更新処理
    const handleItemsUpdate = async (
        id: number,
        updatedValues: {
            modelNumber: string;
            location: string;
            productName: string;
            remarks: string;
        }
    ) => {
        try {
            const response = await axios.put(`/api/items/${id}`, updatedValues);
            console.log("Update success:", response.data);
            await fetchData();
        } catch (error) {
            console.error("Error update item:", error);
        }
    };

    //編集後更新処理
    const handleEditButtonClick = (item: { id: number }) => {
        const isLightRed = btnEditChangeColors[item.id] === "lightred";
        if (isLightRed) {
            //更新する値
            const updatedValues = {
                productName: (
                    document.getElementById(
                        `productName-${item.id}`
                    ) as HTMLInputElement
                ).value,
                modelNumber: (
                    document.getElementById(
                        `modelNumber-${item.id}`
                    ) as HTMLInputElement
                ).value,
                location: (
                    document.getElementById(
                        `location-${item.id}`
                    ) as HTMLInputElement
                ).value,
                remarks: (
                    document.getElementById(
                        `remarks-${item.id}`
                    ) as HTMLInputElement
                ).value,
            };
            handleItemsUpdate(item.id, updatedValues);
        }
        const changeColor = isLightRed ? "lightgreen" : "lightred";
        setBtnEditChangeColors((prev) => ({
            ...prev,
            [item.id]: changeColor,
        }));
    };

    return {handleEditButtonClick,handleItemsUpdate,btnEditChangeColors};
};
