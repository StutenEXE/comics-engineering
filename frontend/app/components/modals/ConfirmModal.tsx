import { useTranslation } from "~/i18n/i18n";
import { GenericModal } from "./GenericModal";
import { insertLinebreaks } from "~/utils/strings";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="rounded-lg text-white p-6 z-10 w-full max-w-md border border-red-700 rounded-lg shadow-md bg-black">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{insertLinebreaks(message)}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 border border-white/10 text-white/60 font-medium text-sm py-2 rounded-md cursor-pointer hover:bg-white/10 hover:text-white/80 transition-all"
          >
            {t("generic.cancel", { capitalize: true })}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500/50 border border-red-500/60 text-white/80 font-medium text-sm py-2 rounded-md cursor-pointer hover:bg-red-500/60 hover:text-white/90 transition-all"
            // className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
          >
            {t("generic.confirm", { capitalize: true })}
          </button>
        </div>
      </div>
    </GenericModal>
  );
}
