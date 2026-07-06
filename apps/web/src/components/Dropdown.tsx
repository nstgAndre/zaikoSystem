import { Transition } from '@headlessui/react';
import {
  createContext,
  type Dispatch,
  Fragment,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useState,
} from 'react';

const DropDownContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  toggleOpen: () => void;
}>({
  open: false,
  setOpen: () => {},
  toggleOpen: () => {},
});

/** Breeze の Dropdown の移植(Inertia Link 依存を除去)。 */
const Dropdown = ({ children }: PropsWithChildren) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((previousState) => !previousState);
  };

  return (
    <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
      <div className="relative">{children}</div>
    </DropDownContext.Provider>
  );
};

const Trigger = ({ children }: PropsWithChildren) => {
  const { open, setOpen, toggleOpen } = useContext(DropDownContext);

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Breeze 原実装の忠実移植 */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: 同上 */}
      <div onClick={toggleOpen}>{children}</div>

      {open && (
        // biome-ignore lint/a11y/noStaticElementInteractions: Breeze 原実装の忠実移植
        // biome-ignore lint/a11y/useKeyWithClickEvents: 同上
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </>
  );
};

const Content = ({
  align = 'right',
  width = '48',
  contentClasses = 'py-1 bg-white',
  children,
}: PropsWithChildren<{ align?: 'left' | 'right'; width?: '48'; contentClasses?: string }>) => {
  const { open, setOpen } = useContext(DropDownContext);

  let alignmentClasses = 'origin-top';
  if (align === 'left') {
    alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
  } else if (align === 'right') {
    alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
  }

  const widthClasses = width === '48' ? 'w-48' : '';

  return (
    <Transition
      as={Fragment}
      show={open}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Breeze 原実装の忠実移植(項目クリックで閉じる) */}
      <div
        className={`absolute z-50 mt-2 rounded-md shadow-lg ${alignmentClasses} ${widthClasses}`}
        onClick={() => setOpen(false)}
        onKeyDown={() => setOpen(false)}
      >
        <div className={`rounded-md ring-1 ring-black ring-opacity-5 ${contentClasses}`}>
          {children}
        </div>
      </div>
    </Transition>
  );
};

const dropdownItemClasses =
  'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out';

const DropdownLink = ({ href, children }: PropsWithChildren<{ href: string }>) => (
  <a href={href} className={dropdownItemClasses}>
    {children}
  </a>
);

const DropdownButton = ({ onClick, children }: PropsWithChildren<{ onClick: () => void }>) => (
  <button type="button" onClick={onClick} className={dropdownItemClasses}>
    {children}
  </button>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
Dropdown.Button = DropdownButton;

export { Dropdown };
