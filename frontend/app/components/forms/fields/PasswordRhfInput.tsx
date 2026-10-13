import { useState } from "react";
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Input } from "~/components/shadcn/ui/input";
import { FieldError, FieldLabel, inputA11yProps, useFieldIds } from "./FieldParts";
import { fieldInputClass, fieldWrapperClass } from "./fieldStyles";

interface PasswordRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: RhfFieldError;
  required?: boolean;
  className?: string;
}

export function PasswordRhfInput({
  label,
  registration,
  inputProps,
  error,
  required,
  className,
}: PasswordRhfInputProps) {
  const [visible, setVisible] = useState(false);
  const { inputId, errorId } = useFieldIds(inputProps?.id);

  return (
    <div className={twMerge(fieldWrapperClass, className)}>
      <FieldLabel htmlFor={inputId} label={label} required={required} />
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          autoComplete="off"
          {...inputA11yProps(errorId, !!error, required)}
          {...registration}
          {...inputProps}
          id={inputId}
          className={twMerge(fieldInputClass, "pr-10")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            // Eye-off icon
            <IoMdEyeOff />
          ) : (
            // Eye icon
            <IoMdEye />
          )}
        </button>
      </div>
      <FieldError id={errorId} message={error?.message} />
    </div>
  );
}
