import { OwnedEditionTable } from "~/components/tables/OwnedEditionTable";
import type { Route } from "../../+types/root";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { SideContentHeader } from "~/components/headers/SideContentHeader";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { useTranslation } from "~/i18n/i18n";

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
