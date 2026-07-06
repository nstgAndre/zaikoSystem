import type { ReactNode } from 'react';

interface GuestLayoutProps {
  className?: string;
  children: ReactNode;
}

/** Breeze の GuestLayout の移植(ロゴリンクは現行でもコメントアウトされているため省略)。 */
export function GuestLayout({ children, className }: GuestLayoutProps) {
  return (
    <div
      className={`min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 ${className ?? ''}`}
    >
      <div className="w-full h-full sm:max-w-6xl mt-6 py-20 border-4 border-lightblue shadow-md overflow-hidden sm:rounded-lg">
        {children}
      </div>
    </div>
  );
}
