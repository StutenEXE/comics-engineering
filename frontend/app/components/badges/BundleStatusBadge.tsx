import { useTranslation } from "~/i18n/i18n";
import { ContributionBundleStatusEnum } from "~/models/contributionBundle";
import { Badge } from "~/components/shadcn/ui/badge";

export function BundleStatusBadge({ status }: { status: ContributionBundleStatusEnum }) {
  const { t } = useTranslation();

  const styles: Record<ContributionBundleStatusEnum, string> = {
    [ContributionBundleStatusEnum.PENDING]:
      "text-amber-400/70 border-amber-400/20 bg-amber-400/5",
    [ContributionBundleStatusEnum.NEEDS_REVISION]:
      "text-purple-400/70 border-purple-400/20 bg-purple-400/5",
    [ContributionBundleStatusEnum.APPROVED]:
      "text-green-400/70 border-green-400/20 bg-green-400/5",
    [ContributionBundleStatusEnum.REJECTED]:
      "text-red-400/70 border-red-400/20 bg-red-400/5",
  };

  return (
    <Badge className={`text-xs px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {t(`cbundle.enum.status.${status}`)}
    </Badge>
  );
}
