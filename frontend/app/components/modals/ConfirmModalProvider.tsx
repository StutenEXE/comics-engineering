'use client'

import { createContext, type ReactNode, useCallback, useContext, useState } from 'react'
import { ConfirmModal, type ConfirmVariant } from './ConfirmModal'

type ConfirmPayload = {
    title: string
    message: string
    onConfirm: () => void
    onClose?: () => void
    // "danger" (default) : red confirm button, for destructive actions
    variant?: ConfirmVariant
}

type ConfirmContextValue = {
    confirm: (payload: ConfirmPayload) => void
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [payload, setPayload] = useState<ConfirmPayload | null>(null)

    const confirm = useCallback((nextPayload: ConfirmPayload) => {
        setPayload(nextPayload)
        setIsOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        if (payload?.onClose) payload.onClose()
        setIsOpen(false)
        setPayload(null)
    }, [payload])

    const handleConfirm = useCallback(() => {
        if (payload?.onConfirm) payload.onConfirm()
        setIsOpen(false)
        setPayload(null)
    }, [payload])

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                isOpen={isOpen}
                title={payload?.title ?? ''}
                message={payload?.message ?? ''}
                variant={payload?.variant}
                onConfirm={handleConfirm}
                onClose={handleClose}
            />
        </ConfirmContext.Provider>
    )
}

export function useConfirm() {
    const context = useContext(ConfirmContext)
    if (!context) {
        throw new Error('useConfirm must be used inside ConfirmModalProvider')
    }
    return context.confirm
}