import { useId } from "react";
import { HelpBadgeTooltip } from "~/components/badges/HelpBadge";
import { useTranslation } from "~/i18n/i18n";
import { fieldErrorClass, fieldLabelClass } from "./fieldStyles";

// Ids linking a label and an error message to their input
export function useFieldIds(id?: string) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return { inputId, errorId: `${inputId}-error` };
}

interface FieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  tooltip?: string;
}

export function FieldLabel({
  htmlFor,
  label,
  required,
  tooltip,
}: FieldLabelProps) {
  const { t } = useTranslation();

  return (
    <label htmlFor={htmlFor} className={fieldLabelClass}>
      {label}
      {required && (
        <span className="text-rose-400" title={t("generic.required")}>
          *
        </span>
      )}
      {tooltip && (
        <span className="ml-1">
          <HelpBadgeTooltip tooltipContent={tooltip} />
        </span>
      )}
    </label>
  );
}

interface FieldErrorProps {
  id: string;
  message?: string;
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={fieldErrorClass}>
      {message}
    </p>
  );
}

// Props to spread on an input so that it is described by its error and flagged as required
export function inputA11yProps(
  errorId: string,
  hasError: boolean,
  required?: boolean,
) {
  return {
    "aria-invalid": hasError ? true : undefined,
    "aria-describedby": hasError ? errorId : undefined,
    "aria-required": required ? true : undefined,
  } as const;
}
