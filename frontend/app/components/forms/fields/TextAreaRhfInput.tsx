import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface TextAreaRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  error?: FieldError;
  className?: string;
}

export function TextAreaRhfInput({
  label,
  registration,
  inputProps,
  error,
  className
}: TextAreaRhfInputProps) {
  return (
    <div className={twMerge("flex flex-col gap-1.5 min-w-[300px]", className)}>
      <label className="text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </label>
      <textarea
        autoComplete="off"
        rows={3}
        {...registration}
        {...inputProps}
        className="w-full min-h-[80px] bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none w-full disabled:opacity-30 disabled:cursor-not-allowed"
      />
      {error && <p className="text-xs text-rose-400/80">{error.message}</p>}
    </div>
  );
}
