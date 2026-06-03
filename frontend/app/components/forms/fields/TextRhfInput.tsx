import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { HelpBadgeTooltip } from "~/components/badges/HelpBadge";
import { Input } from "~/components/ui/input";

interface TextRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: FieldError;
  tooltip?: string;
  className?: string;
}

export function TextRhfInput({
  label,
  registration,
  inputProps,
  error,
  tooltip,
  className,
}: TextRhfInputProps) {
  return (
    <div className={twMerge("flex flex-col gap-1.5", className)}>
      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
        {label} {tooltip && <HelpBadgeTooltip tooltipContent={tooltip} />}
      </label>
      <Input
        autoComplete="off"
        {...registration}
        {...inputProps}
        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      />
      {error && <p className="text-xs text-rose-400/80">{error.message}</p>}
    </div>
  );
}
