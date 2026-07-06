import type { LabelHTMLAttributes } from 'react';

/** Breeze の InputLabel の移植。 */
export function InputLabel({
  value,
  className = '',
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor は呼び出し側から props で渡される汎用部品
    <label {...props} className={`block font-medium text-sm text-gray-700 ${className}`}>
      {value ? value : children}
    </label>
  );
}
