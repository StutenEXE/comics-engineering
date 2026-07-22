import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../../+types/root";
import { OwnedEditionPricesTable } from "~/components/tables/OwnedEditionPricesTable";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Prices of collected editions` },
    { name: "description", content: `Prices of editions from your collection` },
  ];
}

export default function StashPricesPage() {
  const { t } = useTranslation();
  return (
    <SideContentTemplate title={t("stash.prices")}>
      <OwnedEditionPricesTable />
    </SideContentTemplate>
  );
}
