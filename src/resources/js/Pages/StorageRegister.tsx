import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import { PageProps } from '@/types';
import { useInventoryItemState } from '@/hooks/InventoryItems';

export default function InventoryDashboard({ auth }: PageProps) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl pb-1 text-white leading-tight text-left">入庫記録</h2>}
        >
            <Head title="在庫管理システム" />
            <div className="flex items-center justify-center h-screen sm:px-6 lg:px-8">
                <div className="mt-[-30%] border-4 h-96 w-full border-lightblue rounded-lg"></div>
            </div>
        </AuthenticatedLayout>
    );
};
