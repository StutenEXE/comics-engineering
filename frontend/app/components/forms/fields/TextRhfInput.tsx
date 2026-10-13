import { forwardRef, useImperativeHandle, useRef } from "react";
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { Input } from "~/components/shadcn/ui/input";
import { FieldError, FieldLabel, inputA11yProps, useFieldIds } from "./FieldParts";
import { fieldInputClass, fieldWrapperClass } from "./fieldStyles";

export interface TextRhfInputHandle {
  getValue: () => string;
}

interface TextRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: RhfFieldError;
  tooltip?: string;
  required?: boolean;
  // Element rendered right next to the input (ex : an action button)
  endAdornment?: React.ReactNode;
  className?: string;
}

export const TextRhfInput = forwardRef<TextRhfInputHandle, TextRhfInputProps>(
  function TextRhfInput(
    {
      label,
      registration,
      inputProps,
      error,
      tooltip,
      required,
      endAdornment,
      className,
    },
    ref,
  ) {
    const iptRef = useRef<HTMLInputElement>(null);
    const { inputId, errorId } = useFieldIds(inputProps?.id);

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => iptRef.current?.value ?? "",
      }),
      [],
    );

    // Extract the reference from the registeration
    const { ref: registerRef, ...restRegistration } = registration || {};

    // Assigns the reference of the input to the rhf registeration and to our local ref
    const mergedRef = (element: HTMLInputElement | null) => {
      iptRef.current = element;

      if (typeof registerRef === "function") {
        registerRef(element);
      } else if (registerRef && typeof registerRef === "object") {
        (registerRef as React.RefObject<HTMLInputElement | null>).current =
          element;
      }
    };

    return (
      <div className={twMerge(fieldWrapperClass, className)}>
        <FieldLabel
          htmlFor={inputId}
          label={label}
          required={required}
          tooltip={tooltip}
        />
        <div className="flex gap-2">
          <Input
            ref={mergedRef}
            autoComplete="off"
            {...inputA11yProps(errorId, !!error, required)}
            {...restRegistration}
            {...inputProps}
            id={inputId}
            className={fieldInputClass}
          />
          {endAdornment}
        </div>
        <FieldError id={errorId} message={error?.message} />
      </div>
    );
  },
);
