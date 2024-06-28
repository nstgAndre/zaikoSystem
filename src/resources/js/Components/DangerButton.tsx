import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({ className = '', disabled, children, bgColor = 'bg-red-600', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { bgColor?: string }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 ${bgColor} border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest active:bg-red-700 focus:outline-none focus:ring-2  focus:ring-offset-2 transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}