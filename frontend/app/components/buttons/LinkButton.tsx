import { GenericButton, type ButtonProps } from "./GenericButton";

export function LinkButton({ onClick, disabled, children, className }: ButtonProps) {
    return (
        <GenericButton
              onClick={onClick}
              disabled={disabled}
              className={`bg-transparent border border-blue-500 disabled:border-gray-400 ${className}`}
            >
              {children}
        </GenericButton>
    )
}