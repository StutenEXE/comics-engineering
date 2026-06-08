import { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Input } from "~/components/shadcn/ui/input";

interface PasswordRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: FieldError;
  className?: string;
}

export function PasswordRhfInput({
  label,
  registration,
  inputProps,
  error,
  className,
}: PasswordRhfInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={twMerge("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </label>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          autoComplete="off"
          {...registration}
          {...inputProps}
          className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-white/30 hover:text-white/60 transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            // Eye-off icon
            <IoMdEyeOff />
          ) : (
            // Eye icon
            <IoMdEye />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400/80">{error.message}</p>}
    </div>
  );
}
