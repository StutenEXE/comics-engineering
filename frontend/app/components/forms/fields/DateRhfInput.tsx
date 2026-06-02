import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { HelpBadgeTooltip } from "~/components/badges/HelpBadge";

export interface DateRhfInputProps {
  label: string;
  registration?: UseFormRegisterReturn;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  invisible?: boolean;
  error?: FieldError;
  tooltip?: string;
}

export function DateRhfInput({
  label,
  registration,
  inputProps,
  invisible,
  error,
  tooltip,
}: DateRhfInputProps) {
  return (
    <div
      className={twMerge(
        "max-w-45 flex flex-col gap-1.5 flex-1",
        invisible ? "invisible" : "",
      )}
    >
      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/40">
        {label} {tooltip && <HelpBadgeTooltip tooltipContent={tooltip} />}
      </label>
      <input
        type="date"
        autoComplete="off"
        {...registration}
        {...inputProps}
        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all [color-scheme:dark] w-full disabled:opacity-30 disabled:cursor-not-allowed"
      />
      {error && <p className="text-xs text-rose-400/80">{error.message}</p>}
    </div>
  );
}
