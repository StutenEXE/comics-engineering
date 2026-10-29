import { twMerge } from "tailwind-merge";

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  // Accessible name of the group
  label: string;
  className?: string;
}

/**
 * Picks one value among a few (2 to 4) always visible options, faster than a select
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={twMerge(
        "inline-flex max-w-full overflow-x-auto rounded-lg border border-white/10 bg-white/3 p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={twMerge(
              "cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-stash-400/60",
              isSelected
                ? "bg-stash-400/15 text-stash-200"
                : "text-white/45 hover:bg-white/5 hover:text-white/80",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
