import { useEffect } from "react";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={shouldCloseOnOOBClick ? onClose : () => {}}></div>
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-50 max-h-150 overflow-x-auto border border-gray-300 rounded-lg shadow-md bg-black"
        onClick={noPropagationEvt()}
      >
        {children}
      </div>
    </div>
  );
}
