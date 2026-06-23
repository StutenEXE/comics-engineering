import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Collected Editions` },
    { name: "description", content: `Editions from your collection` },
  ];
}

export default function CollectionEditionPage() {
  const { t } = useTranslation();
  return (
    <SideContentTemplate title={t("editions")}>
      <OwnedEditionTable />
    </SideContentTemplate>
  );
}
