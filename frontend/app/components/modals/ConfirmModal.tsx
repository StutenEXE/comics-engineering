import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { GenericModal, ModalTitle } from "./GenericModal";
import { insertLinebreaks } from "~/utils/strings";

export type ConfirmVariant = "danger" | "default";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  // Red confirm button only for destructive actions
  variant?: ConfirmVariant;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="w-[min(28rem,calc(100vw-2rem))] p-6 text-zinc-100">
        <ModalTitle className="text-lg font-semibold mb-3">{title}</ModalTitle>
        <p className="mb-6 text-sm text-zinc-300">
          {insertLinebreaks(message)}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md text-sm font-medium text-zinc-300 cursor-pointer hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            {t("generic.cancel", { capitalize: true })}
          </button>
          <button
            onClick={onConfirm}
            className={twMerge(
              "h-9 px-4 rounded-md text-sm font-medium text-white cursor-pointer transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-indigo-400",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-indigo-600 hover:bg-indigo-500",
            )}
          >
            {t("generic.confirm", { capitalize: true })}
          </button>
        </div>
      </div>
    </GenericModal>
  );
}
