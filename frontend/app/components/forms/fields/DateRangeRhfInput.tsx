import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { DateRhfInput, type DateRhfInputProps } from "./DateRhfInput";

interface DateRangeRhfInputProps {
  startProps: DateRhfInputProps;
  endProps: DateRhfInputProps;
}

export function DateRangeRhfInput({
  startProps,
  endProps,
}: DateRangeRhfInputProps) {
  return (
    <div className="flex items-center gap-3">
      <DateRhfInput {...startProps} />
      <span className="text-white/20 mt-5 text-lg">→</span>
      <DateRhfInput {...endProps} />
    </div>
  );
}
