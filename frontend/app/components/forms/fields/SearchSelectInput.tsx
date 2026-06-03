// Component made by AI (Claude Sonnet 4.6) from a code snippet I gave him

import { useState } from "react";
import type { FieldError } from "react-hook-form";
import { MdDelete } from "react-icons/md";
import { Input } from "~/components/ui/input";
import { useTranslation } from "~/i18n/i18n";

export interface SearchSelectItem {
  id: number;
  name: string;
}

export interface SearchSelectInputProps<T extends SearchSelectItem> {
  /** Field label rendered above the input */
  label: string;

  /** Placeholder text shown inside the search input */
  placeholder?: string;

  /** Currently selected item (controlled) */
  selectedItem?: T;

  /** Called when the user clears the selection */
  onClear?: () => void;

  /**
   * When truthy the component renders a "local ref present" badge instead of
   * the normal selected-item badge and disables the input.
   */
  localRef?: { id: number; name: string };

  /** Text shown inside the badge when `localRef` is set */
  localRefLabel?: string;

  /** Can remove local reference */
  isLocalRefRemovable?: boolean;

  /** Live search results fed from outside (e.g. from an API query) */
  results?: T[];

  /** Called whenever the user types in the search box */
  onSearch?: (value: string) => void;

  /** Called when the user picks an item from the results list */
  onSelect?: (item: T) => void;

  /**
   * Optional render function for each result row.
   * Falls back to displaying `item.name` when omitted.
   */
  renderResult?: (item: T) => React.ReactNode;

  /**
   * Optional render function for the selected-item badge content.
   * Falls back to `name` + `#id` when omitted.
   */
  renderSelected?: (item: T) => React.ReactNode;

  /**
   * Optional error coming from the form
   */
  error?: string;
}

export function SearchSelectInput<T extends SearchSelectItem>({
  label,
  placeholder = "Search…",
  selectedItem,
  onClear,
  localRef,
  localRefLabel,
  isLocalRefRemovable,
  results = [],
  onSearch,
  onSelect,
  renderResult,
  renderSelected,
  error,
}: SearchSelectInputProps<T>) {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    onSearch?.(v);
  };

  const handleSelect = (item: T) => {
    onSelect?.(item);
    setInputValue("");
  };

  const handleClear = () => {
    onClear?.();
    setInputValue("");
  };

  // Determine whether we show the badge or the input
  const isLocalRef = Boolean(localRef);
  const isSelected = Boolean(selectedItem) || isLocalRef;
  const isNegativeId = selectedItem && selectedItem.id < 0;

  return (
    <div className="w-120 flex flex-col gap-1.5">
      {/* Label */}
      <label
        htmlFor="search-select-input"
        className="text-xs font-medium uppercase tracking-widest text-white/40"
      >
        {label}
      </label>

      {isSelected ? (
        /* Selected / local-ref badge */
        <div className="w-full flex items-center justify-between gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-md px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            {/* Checkmark icon */}
            <svg
              viewBox="0 0 10 10"
              className="w-3 h-3 shrink-0 text-indigo-400"
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

            {/* Local-ref or negative-id variant */}
            {isLocalRef || isNegativeId ? (
              <span className="text-xs text-indigo-300/60 flex items-center gap-1">
                {localRefLabel ?? t("generic.localRefPresent")}
              </span>
            ) : selectedItem ? (
              /* Normal selected-item display */
              renderSelected ? (
                renderSelected(selectedItem)
              ) : (
                <>
                  <span className="text-indigo-300 font-medium">
                    {selectedItem.name}
                  </span>
                  <span className="text-white/20 font-mono text-xs">
                    #{selectedItem.id}
                  </span>
                </>
              )
            ) : null}
          </div>

          {/* Clear button — hidden for local refs and negative ids */}
          {(isLocalRef && isLocalRefRemovable) ||
            (selectedItem && (
              <button
                type="button"
                onClick={handleClear}
                className="text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                aria-label="Clear selection"
              >
                <MdDelete size={15} />
              </button>
            ))}
        </div>
      ) : (
        /* Search input + results */
        <>
          <Input
            type="text"
            autoComplete="off"
            id="search-select-input"
            name="search-select-input"
            value={inputValue}
            disabled={isLocalRef}
            placeholder={placeholder}
            onChange={handleChange}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full disabled:opacity-30 disabled:cursor-not-allowed"
          />
          <div className="relative">
            {results.length > 0 && (
              <ol className="absolute top-full left-0 right-0 border bg-black border-white/25 rounded-md overflow-hidden">
                {results.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="px-3 py-2 text-sm text-white/70 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {renderResult ? renderResult(item) : item.name}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
      {error && <p className="text-xs text-rose-400/80">{error}</p>}
    </div>
  );
}
