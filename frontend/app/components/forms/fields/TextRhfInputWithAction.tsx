import React, { useRef } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { GenericButton } from "~/components/buttons/GenericButton";
import { TextRhfInput, type TextRhfInputHandle } from "./TextRhfInput";
import LoadingBadge from "~/components/badges/LoadingBadge";

interface TextRhfInputWithActionProps {
    inputLabel: string;
    registration?: UseFormRegisterReturn;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    buttonLabel?: string;
    buttonOnClick?: (val: string) => void
    error?: FieldError;
    tooltip?: string;
    isLoading?: boolean;
    className?: string;
}

export function TextRhfInputWithAction({ 
    inputLabel, 
    registration, 
    inputProps, 
    buttonLabel, 
    buttonOnClick, 
    error, 
    tooltip,
    isLoading = false, 
    className 
}: TextRhfInputWithActionProps) {
    
    const iptRef = useRef<TextRhfInputHandle>(null);

    const handleClick = () => {
        buttonOnClick?.(iptRef.current?.getValue() || "");
    };

    const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Execute parent code first
        inputProps?.onKeyDown?.(e);
        if (e.key === "Enter") {
            e.preventDefault()
            handleClick();
        }
    };

    return (
    <div className="flex items-end gap-3">
        <TextRhfInput
            ref={iptRef}
            label={inputLabel}
            registration={registration}
            inputProps={{
                ...inputProps,
                onKeyDown: handleEnter,
            }}
            error={error}
            tooltip={tooltip}
            className={className}
        />
        <GenericButton onClick={handleClick}>
            {buttonLabel}
            <LoadingBadge size={20} isLoading={isLoading} className="text-white" />
        </GenericButton>
    </div>
    )
}