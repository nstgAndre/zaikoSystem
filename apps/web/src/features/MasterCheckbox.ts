import type React from 'react';

/** 全選択チェックボックス(現行 features/MasterCheckbox.tsx の忠実移植)。 */
export const useMasterCheckbox = (
  checkBox: { [key: string]: boolean },
  setCheckBox: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
) => {
  const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckState = Object.keys(checkBox).reduce(
      (acc, key) => {
        acc[key] = e.target.checked;
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    setCheckBox(newCheckState);
  };
  return { handleMasterCheckboxChange };
};
