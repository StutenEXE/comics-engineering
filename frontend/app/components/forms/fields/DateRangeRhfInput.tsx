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
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
      <DateRhfInput {...startProps} />
      <span className="text-zinc-500 mt-8 text-sm">→</span>
      <DateRhfInput {...endProps} />
    </div>
  );
}
