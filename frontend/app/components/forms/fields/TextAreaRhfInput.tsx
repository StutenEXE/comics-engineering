import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import {
  fieldErrorClass,
  fieldInputClass,
  fieldLabelClass,
  fieldWrapperClass,
} from "./fieldStyles";

interface TextAreaRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  error?: FieldError;
  className?: string;
}

export function TextAreaRhfInput({
  label,
  registration,
  inputProps,
  error,
  className
}: TextAreaRhfInputProps) {
  return (
    <div className={twMerge(fieldWrapperClass, className)}>
      <label className={fieldLabelClass}>{label}</label>
      <textarea
        autoComplete="off"
        rows={3}
        aria-invalid={error ? true : undefined}
        {...registration}
        {...inputProps}
        className={twMerge(fieldInputClass, "h-auto min-h-20 resize-y")}
      />
      {error && <p className={fieldErrorClass}>{error.message}</p>}
    </div>
  );
}
