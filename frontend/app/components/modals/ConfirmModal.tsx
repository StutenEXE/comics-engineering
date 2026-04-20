import { useTranslation } from "~/i18n/i18n"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
    const { t } = useTranslation();

    return (
        <div className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 flex items-center justify-center z-50`}>
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="rounded-lg p-6 z-10 w-full max-w-md border border-red-700 rounded-lg shadow-md bg-black">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors cursor-pointer"
                    >
                        {t("generic.cancel", { capitalize: true })}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
                    >
                        {t("generic.confirm", { capitalize: true })}
                    </button>
                </div>
            </div>
        </div>
    )
}
