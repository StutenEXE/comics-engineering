import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../../+types/root";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { ContributionTable } from "~/components/tables/ContributionTable";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contributions` },
    { name: "description", content: `Contributions you made` },
  ];
}

export default function CollectionEditionPage() {
  const { t } = useTranslation();
  return (
    <SideContentTemplate title={t("contributions")}>
      <ContributionTable />
    </SideContentTemplate>
  );
}
