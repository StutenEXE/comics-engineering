import {
  IoAddCircleOutline,
  IoCheckmarkCircleOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";
import { useTranslation } from "~/i18n/i18n.js";
import { Badge } from "../shadcn/ui/badge";
import { SearchInput } from "./SearchInput";
import { useState } from "react";

interface SearchAllInputProps {
  defaultValue?: string;
  defaultFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  triggerSearch: (query: string) => void;
}

const badgeClassNames = {
  neutral:
    "text-xs px-1.5 py-0.5 rounded border text-neutral-400/70 border-neutral-400/20 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/20 transition-all",
  selected:
    "text-xs px-1.5 py-0.5 rounded border text-blue-400/70 border-blue-400/20 bg-blue-400/5",
  toDelete:
    "text-xs px-1.5 py-0.5 rounded border text-red-400/70 border-red-400/20 bg-red-400/5",
};

export function SearchAllInput({
  defaultValue = "",
  defaultFilters = ["books", "series", "issues", "issueseries"],
  triggerSearch,
  onFilterChange,
}: SearchAllInputProps) {
  const { t } = useTranslation();

  const [options, setOptions] = useState([
    { labelId: "editions", selected: false },
    { labelId: "books", selected: defaultFilters.includes("books") },
    { labelId: "series", selected: defaultFilters.includes("series") },
    { labelId: "issues", selected: defaultFilters.includes("issues") },
    {
      labelId: "issueseries",
      selected: defaultFilters.includes("issueseries"),
    },
  ]);

  const handleFilterChange = (optionLabel: string, selected: boolean) => {
    // To avoid race conditions, we compute the new filters based on the current options
    const filters = options
      .filter((opt) => opt.selected)
      .map((opt) => opt.labelId);
    if (selected) filters.push(optionLabel);
    else filters.splice(filters.indexOf(optionLabel), 1);
    onFilterChange?.(filters);

    // Update the options state to reflect the new selection
    setOptions(
      options.map((obj) =>
        obj.labelId === optionLabel ? { ...obj, selected: selected } : obj,
      ),
    );
  };

  return (
    <div className="">
      <SearchInput defaultValue={defaultValue} triggerSearch={triggerSearch} />
      <div className="flex px-2 gap-1">
        {options.map((option) => {
          if (option.selected) {
            return (
              <Badge
                key={option.labelId}
                className={
                  "group text-xs px-1.5 py-0.5 rounded border text-blue-500/70 border-blue-500/20 bg-blue-400/5 cursor-pointer transition-all" +
                  " hover:text-red-400/70 hover:border-red-400/20 hover:bg-red-400/5"
                }
                onClick={() => {
                  handleFilterChange(option.labelId, false);
                }}
              >
                <IoCheckmarkCircleOutline
                  size={16}
                  className="group-hover:hidden transition-200"
                />
                <IoRemoveCircleOutline
                  size={16}
                  className="hidden group-hover:block transition-200"
                />
                {t(option.labelId)}
              </Badge>
            );
          } else {
            return (
              <Badge
                key={option.labelId}
                className="group text-xs px-1.5 py-0.5 rounded border text-neutral-400/70 border-neutral-400/20 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/20 transition-all"
                onClick={() => {
                  handleFilterChange(option.labelId, true);
                }}
              >
                <IoAddCircleOutline size={16} />
                {t(option.labelId)}
              </Badge>
            );
          }
        })}
      </div>
    </div>
  );
}
