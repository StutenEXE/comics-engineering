import { useState } from "react";
import { MdSearch } from "react-icons/md";
import { useTranslation } from "~/i18n/i18n.js";

interface SearchInputProps {
  defaultValue?: string;
  triggerSearch: (query: string) => void;
}

export function SearchInput({
  defaultValue = "",
  triggerSearch,
}: SearchInputProps) {
  const { t } = useTranslation();

  const [isLT3, setIsLT3] = useState(false);

  const onChange = (query: string) => {
    query = query.trim();
    setIsLT3(query.length < 3);
    triggerSearch(query);
  };

  return (
    <div className="w-full flex flex-col gap-2 p-2 bg-black/80 backdrop-blur-md">
      <label
        htmlFor="search"
        className="text-xs font-medium uppercase tracking-widest text-white/40"
      >
        {t("search.header")}
      </label>
      <div className="relative">
        <input
          type="text"
          id="search"
          name="search"
          autoComplete="off"
          placeholder={t("search.placeholder")}
          onChange={(e) => onChange(e.target.value)}
          defaultValue={defaultValue}
          className="bg-white/5 border border-white/10 rounded-md px-4 py-2.5 pr-10 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full"
        />
        {/* Search icon */}
        <MdSearch
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
          size={18}
        />
      </div>

      {/* Hint */}
      {isLT3 && (
        <p className="text-xs text-white/25 italic">{t("search.gte3chars")}</p>
      )}
    </div>
  );
}
