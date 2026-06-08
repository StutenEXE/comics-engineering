import { Badge } from "~/components/ui/badge";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { ContributionStatusEnum } from "~/models/contribution";

interface ContributionStatusBadgeProps {
  status: ContributionStatusEnum;
  className?: string;
}

export function ContributionStatusBadge({
  status,
  className,
}: ContributionStatusBadgeProps) {
  const { t } = useTranslation();

  const styles: Record<ContributionStatusEnum, string> = {
    [ContributionStatusEnum.PENDING]:
      "text-amber-400/70 border-amber-400/20 bg-amber-400/5",
    [ContributionStatusEnum.NEEDS_REVISION]:
      "text-purple-400/70 border-purple-400/20 bg-purple-400/5",
    [ContributionStatusEnum.APPROVED]:
      "text-green-400/70 border-green-400/20 bg-green-400/5",
    [ContributionStatusEnum.REJECTED]:
      "text-red-400/70 border-red-400/20 bg-red-400/5",
    [ContributionStatusEnum.SKIPPED]:
      "text-amber-400/70 border-amber-400/20 bg-amber-400/5",
  };

  return (
    <Badge
      className={twMerge(
        "text-xs px-1.5 py-0.5 rounded border",
        styles[status],
        className
      )}
    >
      {t(`contribution.enum.status.${status}`)}
    </Badge>
  );
}
