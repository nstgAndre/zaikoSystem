import { Link, type LinkProps } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';

/** Breeze の NavLink の移植(Inertia Link → TanStack Router Link)。 */
export function NavLink({
  active = false,
  className = '',
  children,
  ...props
}: PropsWithChildren<LinkProps & { active: boolean; className?: string }>) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
        active
          ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 '
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
      }${className}`}
    >
      {children}
    </Link>
  );
}
