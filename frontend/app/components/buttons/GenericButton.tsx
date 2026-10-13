import type { MouseEventHandler, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/shadcn/ui/button";

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
    <Button
      variant={"default"}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        // Focus : crisp outline instead of shadcn's blurred ring
        "px-4 py-2 bg-blue-500 rounded-lg cursor-pointer text-white disabled:cursor-not-allowed disabled:bg-gray-400 hover:bg-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-0 focus-visible:border-transparent focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-indigo-400",
        className,
      )}
    >
      {children}
    </Button>
  );
}
