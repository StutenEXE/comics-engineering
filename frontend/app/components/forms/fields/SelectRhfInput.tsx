// Component made by AI (Claude Sonnet 4.6)

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/shadcn/ui/select";
import { useTranslation } from "~/i18n/i18n";

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
    <div className=" flex flex-col gap-1.5">
      {label && (
        <label className="w-full text-xs font-medium uppercase tracking-widest text-white/40">
          {label}
        </label>
      )}
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full min-w-50 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer">
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
