import { Link } from "react-router";
import { GenericButton, type ButtonProps } from "./GenericButton";
import { useState, type MouseEventHandler } from "react";

export interface ToggleButtonProps extends ButtonProps {
    selected?: boolean
};

export function ToggleButton({ selected, onClick, disabled, children, className }:  ToggleButtonProps) {
    return (
        <GenericButton
                onClick={onClick}
                disabled={disabled}
                className={`border
                    ${selected 
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20 hover:border-blue-500 hover:bg-blue-700" 
                        : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:bg-gray-700"
                    }
                    ${className}`
                }
            >
                {children}
        </GenericButton>
    )
}