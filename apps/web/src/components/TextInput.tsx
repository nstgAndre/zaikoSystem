import { type InputHTMLAttributes, useEffect, useRef } from 'react';

/** Breeze の TextInput の移植。isFocused でマウント時にフォーカスする。 */
export function TextInput({
  type = 'text',
  className = '',
  isFocused = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean }) {
  const localRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, [isFocused]);

  return (
    <input
      {...props}
      type={type}
      className={`border-lightblue rounded-md shadow-sm focus:border-lightblue focus:ring-lightblue ${className}`}
      ref={localRef}
    />
  );
}
