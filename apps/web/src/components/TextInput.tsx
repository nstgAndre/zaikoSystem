import { type InputHTMLAttributes, type Ref, useEffect, useRef } from 'react';

/**
 * Breeze の TextInput の移植。isFocused でマウント時にフォーカスする。
 * React 19 の ref-as-prop で外部 ref(エラー時フォーカス移動用)も受け付ける。
 */
export function TextInput({
  type = 'text',
  className = '',
  isFocused = false,
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  isFocused?: boolean;
  ref?: Ref<HTMLInputElement>;
}) {
  const localRef = useRef<HTMLInputElement | null>(null);

  const setRefs = (el: HTMLInputElement | null) => {
    localRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };

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
      ref={setRefs}
    />
  );
}
