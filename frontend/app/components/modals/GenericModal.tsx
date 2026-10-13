import { createContext, useContext, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { noPropagationEvt } from "~/utils/events";

// Lets the modal content (ex : GenericForm's title) label the dialog for screen readers
const ModalTitleIdContext = createContext<string | undefined>(undefined);
export const useModalTitleId = () => useContext(ModalTitleIdContext);

// Heading used as the accessible name of the surrounding modal (if any)
export function ModalTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const titleId = useModalTitleId();
  return <h2 id={titleId} {...props} />;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  shouldCloseOnOOBClick?: boolean;
  // Defaults to shouldCloseOnOOBClick : modals protecting user input don't close on Escape either
  shouldCloseOnEscape?: boolean;
  children: React.ReactNode;
}
export function GenericModal({
  isOpen,
  onClose,
  shouldCloseOnOOBClick = true,
  shouldCloseOnEscape = shouldCloseOnOOBClick,
  children,
}: GenericModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus inside the dialog, and give it back to the opener on close
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  // Nested modals are children of this one in the React tree : their key events bubble up here,
  // so propagation is stopped to only act on the top-most modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (shouldCloseOnEscape) onClose();
      return;
    }
    if (e.key !== "Tab" || !dialogRef.current) return;
    e.stopPropagation();

    // Focus trap : Tab cycles inside the dialog
    const focusables = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Rendered in body so that no transformed / blurred ancestor can offset the "fixed" positioning
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      <div className="absolute inset-0 bg-black/70" onClick={shouldCloseOnOOBClick ? onClose : () => {}}></div>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        // Small screens : fits the viewport (dvh follows the mobile browser bars), scrolls vertically
        className="relative z-50 w-fit max-w-full max-h-[calc(100dvh-1.5rem)] md:max-h-[min(85dvh,56rem)] overflow-auto overscroll-contain border border-zinc-800 rounded-lg bg-zinc-950 outline-none"
        onClick={noPropagationEvt()}
      >
        <ModalTitleIdContext.Provider value={titleId}>
          {children}
        </ModalTitleIdContext.Provider>
      </div>
    </div>,
    document.body,
  );
}
