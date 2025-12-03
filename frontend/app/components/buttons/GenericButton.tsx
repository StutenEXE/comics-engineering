import type { MouseEventHandler, ReactNode } from "react";

export type ButtonProps = {
    onClick?: MouseEventHandler,
    disabled?: boolean,
    className?: string,
    children?: ReactNode
};

export function GenericButton({ onClick, disabled, children, className }: ButtonProps) {
    return (
        <button
              onClick={onClick}
              disabled={disabled}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer 
              disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-blue-600 transition
              ${className}`}
            >
              {children}
        </button>
    )
}