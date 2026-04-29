import { useTranslation } from "~/i18n/i18n";
import type { Serie } from "~/models/serie";
import { useLazySearchSeriesByNameQuery } from "~/store/services/api";

interface SerieFormProps {
  serie?: Serie;
  onSubmit?: () => {};
  onCancel?: () => {};
}

export function SerieContributionForm({
  serie,
  onSubmit,
  onCancel,
}: SerieFormProps) {
  const { t } = useTranslation();

  const [search, { data, isLoading }] = useLazySearchSeriesByNameQuery();

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    search({ query: value }); 
  }

  return (
    <div className="w-1/2 mb-4 ">
      <label htmlFor="text" className="block font-semibold mb-2">
        {t("search.header")}
      </label>
      <input
        type="text"
        id="search"
        name="search"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={t("search.placeholder")}
        onChange={handleSearch}
      />
      <div>
        <ol>
            { data?.series && data?.series.map((ser) => <li>{ser.name}</li>) } 
        </ol>
      </div>
    </div>
  );
}
