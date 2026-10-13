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

export interface DateRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  invisible?: boolean;
  error?: FieldError;
  tooltip?: string;
  className?: string;
}

export function DateRhfInput({
  label,
  registration,
  inputProps,
  invisible,
  error,
  tooltip,
  className,
}: DateRhfInputProps) {
  return (
    <div
      className={twMerge(
        fieldWrapperClass,
        invisible ? "invisible" : "",
        className,
      )}
    >
      <label className={fieldLabelClass}>
        {label} {tooltip && <HelpBadgeTooltip tooltipContent={tooltip} />}
      </label>
      <Input
        type="date"
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        {...registration}
        {...inputProps}
        className={twMerge(fieldInputClass, "[color-scheme:dark]")}
      />
      {error && <p className={fieldErrorClass}>{error.message}</p>}
    </div>
  );
}
