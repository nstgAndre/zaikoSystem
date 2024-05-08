import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
// import { PropsWithChildren } from 'react';

interface GuestLayoutProps {
    className?: string;
    children: React.ReactNode;
};

export default function Guest({ children, className }: GuestLayoutProps) {
    return (
        <div className={`min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 ${className}`}>
            <div>
                {/* <Link href="/"> 
                    <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
                </Link> */}
            </div>

            <div className="w-full h-full sm:max-w-6xl mt-6 py-20 border-4 border-lightblue shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}