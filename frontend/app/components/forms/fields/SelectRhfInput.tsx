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
import {
  fieldInputClass,
  fieldLabelClass,
  fieldWrapperClass,
} from "./fieldStyles";

interface SelectRhfInputProps {
  label?: string;
  defaultVal?: string;
  options: { label: string; value: string | number }[];
  registration: UseFormRegisterReturn;
  placeholder?: string;
}

export function SelectRhfInput({
  label,
  defaultVal,
  options,
  registration,
  placeholder,
}: SelectRhfInputProps) {
  const { t } = useTranslation();

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
      {label && <label className={fieldLabelClass}>{label}</label>}
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger
          className={twMerge(fieldInputClass, "cursor-pointer")}
        >
          <SelectValue
            placeholder={
              placeholder ?? t("generic.select", { capitalize: true })
            }
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" {...registration} value={selectedValue} />
    </div>
  );
}
