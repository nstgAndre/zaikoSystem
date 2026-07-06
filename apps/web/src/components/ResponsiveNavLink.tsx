import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

/** Breeze の ResponsiveNavLink の移植(アンカー版)。 */
export function ResponsiveNavLink({
  active = false,
  className = '',
  children,
  ...props
}: PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean; className?: string }
>) {
  return (
    <a
      {...props}
      className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${
        active
          ? 'border-indigo-400 text-indigo-700 bg-indigo-50 focus:text-indigo-800 focus:bg-indigo-100 focus:border-indigo-700'
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300'
      } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
    >
      {children}
    </a>
  );
}

/** ボタン版(Log Out 用)。 */
export function ResponsiveNavButton({
  className = '',
  children,
  onClick,
}: PropsWithChildren<{ className?: string; onClick: () => void }>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300 text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
    >
      {children}
    </button>
  );
}
