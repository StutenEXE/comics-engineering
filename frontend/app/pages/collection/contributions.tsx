import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../../+types/root";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { ContributionTable } from "~/components/tables/ContributionTable";
import { UserContributionMetrics } from "~/components/metrics/contributions/UserContributionMetrics";
import { useAppSelector } from "~/store/hooks";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contributions` },
    { name: "description", content: `Contributions you made` },
  ];
}

export default function CollectionEditionPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  return (
    <SideContentTemplate title={t("contributions")}>
      <UserContributionMetrics userId={user?.id} />
      <ContributionTable />
    </SideContentTemplate>
  );
}
