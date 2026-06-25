import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/shadcn/ui/select";
import { useTranslation } from "~/i18n/i18n";

interface SelectInputProps {
  options: {
    label: string;
    value: any;
  }[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  selectAll?: boolean;
  onValueChange?: (val: string) => void;
}

export function SelectInput({
  options,
  value,
  defaultValue,
  placeholder,
  selectAll,
  onValueChange,
}: SelectInputProps) {
  const { t } = useTranslation();
  return (
    <Select
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue
          placeholder={placeholder || t("generic.search.placeholder")}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>
            {placeholder || t("generic.search.placeholder")}
          </SelectLabel>
          {selectAll && (
            <SelectItem value="any">
              {t("generic.all", {
                capitalize: true,
              })}
            </SelectItem>
          )}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
