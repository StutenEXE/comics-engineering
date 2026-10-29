import { useSearchParams } from "react-router";
import { SegmentedControl } from "~/components/misc/SegmentedControl";
import { OwnedEditionPricesTable } from "~/components/tables/OwnedEditionPricesTable";
import { SeriePricesTable } from "~/components/tables/SeriePricesTable";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Prices of collected editions` },
    { name: "description", content: `Prices of editions from your collection` },
  ];
}

type PricesView = "edition" | "serie";

export default function StashPricesPage() {
  const { t } = useTranslation();

  // Kept in the URL so the view survives a reload and the back button
  const [searchParams, setSearchParams] = useSearchParams();
  const view: PricesView =
    searchParams.get("view") === "serie" ? "serie" : "edition";
  const setView = (v: PricesView) =>
    setSearchParams(v === "serie" ? { view: v } : {}, { replace: true });

  return (
    <SideContentTemplate title={t("stash.prices")}>
      <SegmentedControl
        label={t("stash.prices.view")}
        value={view}
        onChange={setView}
        options={[
          { label: t("stash.prices.view.edition"), value: "edition" },
          { label: t("stash.prices.view.serie"), value: "serie" },
        ]}
        className="self-start"
      />
      {view === "edition" ? <OwnedEditionPricesTable /> : <SeriePricesTable />}
    </SideContentTemplate>
  );
}
