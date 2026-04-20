interface GenericModalProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

export function GenericModal({ isOpen, onClose, children }: GenericModalProps) {
    if (!isOpen) return null
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative z-50">
                {children}
            </div>
        </div>
    )
}