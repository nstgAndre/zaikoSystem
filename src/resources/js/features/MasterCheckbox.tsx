import React from 'react';
// import { useState } from 'react';

export const useMasterCheckbox = (checkBox: { [key: string]: boolean }, setCheckBox: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>) => {
    const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCheckState = Object.keys(checkBox).reduce((acc, key) => {
            acc[key] = e.target.checked;
            return acc;
        }, {} as { [key: string]: boolean });
        setCheckBox(newCheckState);
    };
    return { handleMasterCheckboxChange };
};