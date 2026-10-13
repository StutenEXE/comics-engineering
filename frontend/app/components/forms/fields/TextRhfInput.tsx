import { forwardRef, useImperativeHandle, useRef } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { HelpBadgeTooltip } from "~/components/badges/HelpBadge";
import { Input } from "~/components/shadcn/ui/input";
import {
  fieldErrorClass,
  fieldInputClass,
  fieldLabelClass,
  fieldWrapperClass,
} from "./fieldStyles";

export interface TextRhfInputHandle {
  getValue: () => string;
}

interface TextRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: FieldError;
  tooltip?: string;
  // Element rendered right next to the input (ex : an action button)
  endAdornment?: React.ReactNode;
  className?: string;
}

export const TextRhfInput = forwardRef<TextRhfInputHandle, TextRhfInputProps>(
  function TextRhfInput(
    { label, registration, inputProps, error, tooltip, endAdornment, className },
    ref,
  ) {
    const iptRef = useRef<HTMLInputElement>(null);

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
        <label className={fieldLabelClass}>
          {label} {tooltip && <HelpBadgeTooltip tooltipContent={tooltip} />}
        </label>
        <div className="flex gap-2">
          <Input
            ref={mergedRef}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            {...restRegistration}
            {...inputProps}
            className={fieldInputClass}
          />
          {endAdornment}
        </div>
        {error && <p className={fieldErrorClass}>{error.message}</p>}
      </div>
    );
  },
);
