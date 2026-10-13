import type { FieldError as RhfFieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { Input } from "~/components/shadcn/ui/input";
import { FieldError, FieldLabel, inputA11yProps, useFieldIds } from "./FieldParts";
import { fieldInputClass, fieldWrapperClass } from "./fieldStyles";

export interface DateRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  invisible?: boolean;
  error?: RhfFieldError;
  tooltip?: string;
  required?: boolean;
  className?: string;
}

export function DateRhfInput({
  label,
  registration,
  inputProps,
  invisible,
  error,
  tooltip,
  required,
  className,
}: DateRhfInputProps) {
  const { inputId, errorId } = useFieldIds(inputProps?.id);

  return (
    <div
      className={twMerge(
        fieldWrapperClass,
        invisible ? "invisible" : "",
        className,
      )}
    >
      <FieldLabel
        htmlFor={inputId}
        label={label}
        required={required}
        tooltip={tooltip}
      />
      <Input
        type="date"
        autoComplete="off"
        {...inputA11yProps(errorId, !!error, required)}
        {...registration}
        {...inputProps}
        id={inputId}
        className={twMerge(fieldInputClass, "[color-scheme:dark]")}
      />
      <FieldError id={errorId} message={error?.message} />
    </div>
  );
}
