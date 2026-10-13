import { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Input } from "~/components/shadcn/ui/input";
import {
  fieldErrorClass,
  fieldInputClass,
  fieldLabelClass,
  fieldWrapperClass,
} from "./fieldStyles";

interface PasswordRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: FieldError;
  className?: string;
}

export function PasswordRhfInput({
  label,
  registration,
  inputProps,
  error,
  className,
}: PasswordRhfInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={twMerge(fieldWrapperClass, className)}>
      <label className={fieldLabelClass}>{label}</label>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          {...registration}
          {...inputProps}
          className={twMerge(fieldInputClass, "pr-10")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-300 transition-colors"
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
      {error && <p className={fieldErrorClass}>{error.message}</p>}
    </div>
  );
}
