import type { HTMLAttributes } from 'react';

/** Breeze の InputError の移植。message が空なら何も描画しない。 */
export function InputError({
  message,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
  return message ? (
    <p {...props} className={`text-sm text-red-600 ${className}`}>
      {message}
    </p>
  ) : null;
}
