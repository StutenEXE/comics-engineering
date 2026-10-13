// Shared look of every form field, so all inputs stay consistent

export const fieldWrapperClass = "flex flex-col gap-1.5 min-w-0";

export const fieldLabelClass =
  "flex items-center gap-1 text-sm font-medium text-zinc-300";

// Focus : crisp 2px indigo edge (border + 1px solid ring), no blur / halo
export const fieldInputClass =
  "h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition-colors hover:border-zinc-600 focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-400 aria-invalid:border-rose-500 aria-invalid:ring-0 aria-invalid:focus-visible:ring-1 aria-invalid:focus-visible:ring-rose-500 dark:aria-invalid:focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-40";

export const fieldErrorClass = "text-xs text-rose-400";

export const secondaryButtonClass =
  "h-9 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm font-medium text-zinc-100 hover:bg-zinc-700";

// Text inputs for numbers (no wheel / spinner surprises) : accept "12,5" as well as "12.5"
export const decimalValueAs = (v: unknown) =>
  typeof v === "string" ? v.trim().replace(",", ".") : v;
