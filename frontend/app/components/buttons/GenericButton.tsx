import type { MouseEventHandler, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  onClick?: MouseEventHandler;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  type?: "button" | "submit" | "reset";
}

export function GenericButton({
  onClick,
  disabled,
  children,
  className,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        "px-4 py-2 bg-blue-500 rounded-lg cursor-pointer text-white disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-blue-600 transition",
        className,
      )}
    >
      {children}
    </button>
  );
}
