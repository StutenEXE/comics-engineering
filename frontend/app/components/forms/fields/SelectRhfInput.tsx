// Component made by AI (Claude Sonnet 4.6)

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/shadcn/ui/select";
import { useTranslation } from "~/i18n/i18n";
import { FieldLabel, useFieldIds } from "./FieldParts";
import { fieldInputClass, fieldWrapperClass } from "./fieldStyles";

interface SelectRhfInputProps {
  label?: string;
  defaultVal?: string;
  options: { label: string; value: string | number }[];
  registration: UseFormRegisterReturn;
  placeholder?: string;
  required?: boolean;
}

export function SelectRhfInput({
  label,
  defaultVal,
  options,
  registration,
  placeholder,
  required,
}: SelectRhfInputProps) {
  const { t } = useTranslation();
  const { inputId } = useFieldIds();

  const [selectedValue, setSelectedValue] = useState(defaultVal);

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    registration.onChange({
      target: {
        name: registration.name,
        value,
      },
    } as unknown as Event);
  };

  return (
    <div className={fieldWrapperClass}>
      {label && (
        <FieldLabel htmlFor={inputId} label={label} required={required} />
      )}
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger
          id={inputId}
          aria-required={required || undefined}
          className={twMerge(fieldInputClass, "cursor-pointer")}
        >
          <SelectValue
            placeholder={
              placeholder ?? t("generic.select", { capitalize: true })
            }
          />
        </SelectTrigger>
        <SelectContent className="rounded-md border border-zinc-700 bg-zinc-900 shadow-none ring-0 dark:ring-0">
          {options.map((opt) => (
            <SelectItem
              key={String(opt.value)}
              value={String(opt.value)}
              className="rounded-sm text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" {...registration} value={selectedValue} />
    </div>
  );
}
