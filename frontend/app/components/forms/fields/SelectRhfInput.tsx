// Component made by AI (Claude Sonnet 4.6)

import type { UseFormRegisterReturn } from "react-hook-form";

interface SelectRhfInputProps{
  label?: string;
  options: { label: string; value: string | number }[];
  registration: UseFormRegisterReturn;
  placeholder?: string;
}

export function SelectRhfInput({
  label,
  options,
  registration,
  placeholder,
}: SelectRhfInputProps) {
  return (
    <div className="w-[100%] flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium uppercase tracking-widest text-white/40">
          {label}
        </label>
      )}
      <select
        {...registration}
        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer appearance-none
        [&>option]:bg-gray-900"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="cursor-pointer">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}