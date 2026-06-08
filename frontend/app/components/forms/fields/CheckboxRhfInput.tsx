import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { Input } from "~/components/shadcn/ui/input";

interface CheckboxRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: FieldError;
}

export function CheckboxRhfInput({
  label,
  registration,
  inputProps,
  error,
}: CheckboxRhfInputProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className="relative">
        <Input
          type="checkbox"
            autoComplete="off"
          {...registration}
          {...inputProps}
          className="peer sr-only"
        />
        <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-white/40" />
        <svg
          className="absolute inset-0 m-auto w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M1.5 5l2.5 2.5 4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">
        {label}
      </span>
      {error && <p className="text-xs text-rose-400/80">{error.message}</p>}
    </label>
  );
}
