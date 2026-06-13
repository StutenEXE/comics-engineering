import { GenericButton } from "~/components/buttons/GenericButton";
import { TextRhfInput, type TextRhfInputHandle } from "./TextRhfInput";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import React, { useRef } from "react";
import { preventDefaultEvt } from "~/utils/events";

interface TextRhfInputWithActionProps {
    inputLabel: string;
    registration?: UseFormRegisterReturn;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    buttonLabel?: string;
    buttonOnClick?: (val: string) => void
    error?: FieldError;
    tooltip?: string;
    className?: string;
}

export function TextRhfInputWithAction({ inputLabel, registration, inputProps, buttonLabel, buttonOnClick, error, tooltip, className }: TextRhfInputWithActionProps) {
    
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
        <GenericButton onClick={handleClick}>{buttonLabel}</GenericButton>
    </div>
    )
}