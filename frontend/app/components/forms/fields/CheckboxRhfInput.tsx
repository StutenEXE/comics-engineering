import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { Input } from "~/components/shadcn/ui/input";
import { fieldErrorClass } from "./fieldStyles";

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
        <div className="w-4 h-4 rounded border border-zinc-600 bg-zinc-900 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 peer-focus-visible:border-indigo-400 transition-colors group-hover:border-zinc-400" />
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
      <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors select-none">
        {label}
      </span>
      {error && <p className={fieldErrorClass}>{error.message}</p>}
    </label>
  );
}
