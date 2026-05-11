import { useEffect } from "react"
import { noPropagationEvt } from "~/utils/events"

interface GenericModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}
export function GenericModal({ isOpen, onClose, children }: GenericModalProps) {
    useEffect(() => {
        if (!isOpen) return

        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative z-50 max-h-150 overflow-x-auto" onClick={noPropagationEvt()}>
                {children}
            </div>
        </div>
    )
}