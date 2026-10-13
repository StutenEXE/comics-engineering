import { useEffect } from "react";
import { createPortal } from "react-dom";
import { noPropagationEvt } from "~/utils/events";

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  shouldCloseOnOOBClick?: boolean;
  children: React.ReactNode;
}
export function GenericModal({ isOpen, onClose, shouldCloseOnOOBClick = true, children }: GenericModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  // Rendered in body so that no transformed / blurred ancestor can offset the "fixed" positioning
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      <div className="absolute inset-0 bg-black/70" onClick={shouldCloseOnOOBClick ? onClose : () => {}}></div>
      <div
        role="dialog"
        aria-modal="true"
        // Small screens : fits the viewport (dvh follows the mobile browser bars), scrolls vertically
        className="relative z-50 w-fit max-w-full max-h-[calc(100dvh-1.5rem)] md:max-h-[min(85dvh,56rem)] overflow-auto overscroll-contain border border-zinc-800 rounded-lg bg-zinc-950"
        onClick={noPropagationEvt()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
