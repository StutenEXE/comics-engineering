import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: FieldError;
}

export function TextRhfInput({
  label,
  registration,
  inputProps,
  error,
}: TextRhfInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </label>
      <input
        {...registration}
        {...inputProps}
        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      />
      {error && <p className="text-xs text-rose-400/80">{error.message}</p>}
    </div>
  );
}
