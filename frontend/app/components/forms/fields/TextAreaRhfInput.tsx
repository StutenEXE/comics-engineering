import type { FieldError as RhfFieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { FieldError, FieldLabel, inputA11yProps, useFieldIds } from "./FieldParts";
import { fieldInputClass, fieldWrapperClass } from "./fieldStyles";

interface TextAreaRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  error?: RhfFieldError;
  required?: boolean;
  className?: string;
}

export function TextAreaRhfInput({
  label,
  registration,
  inputProps,
  error,
  required,
  className
}: TextAreaRhfInputProps) {
  const { inputId, errorId } = useFieldIds(inputProps?.id);

  return (
    <div className={twMerge(fieldWrapperClass, className)}>
      <FieldLabel htmlFor={inputId} label={label} required={required} />
      <textarea
        autoComplete="off"
        rows={3}
        {...inputA11yProps(errorId, !!error, required)}
        {...registration}
        {...inputProps}
        id={inputId}
        className={twMerge(fieldInputClass, "h-auto min-h-20 resize-y")}
      />
      <FieldError id={errorId} message={error?.message} />
    </div>
  );
}
