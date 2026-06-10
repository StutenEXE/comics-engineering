import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";

interface ContributionMetricsProps {
  metrics?: ContributionsStats;
  isLoading?: boolean;
  className?: string;
}

export function ContributionMetrics({
  metrics,
  isLoading,
  className,
}: ContributionMetricsProps) {
  const { t } = useTranslation();

  if (!metrics) return null;

  return (
    <div className={twMerge("flex flex-col gap-6", className)}>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
        <MetricCard
          val={metrics?.total}
          label={t("contribution.stats.total")}
          valClassName="text-blue-400"
          isLoading={isLoading}
        />
        <MetricCard
          val={metrics?.status.approved.total}
          label={t("contribution.stats.approved")}
          valClassName="text-green-400"
          isLoading={isLoading}
        />
        <MetricCard
          val={metrics?.status.pending.total}
          label={t("contribution.stats.pending")}
          valClassName="text-amber-400"
          isLoading={isLoading}
        />
        <MetricCard
          val={metrics?.status.needs_revision.total}
          label={t("contribution.stats.needsRevision")}
          valClassName="text-purple-400"
          isLoading={isLoading}
        />
        <MetricCard
          val={metrics?.status.rejected.total}
          label={t("contribution.stats.rejected")}
          valClassName="text-red-400"
          isLoading={isLoading}
        />
        <MetricCard
          val={metrics?.status.skipped.total}
          label={t("contribution.stats.skipped")}
          valClassName="text-gray-400"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  val?: any;
  label?: string;
  valClassName?: string;
  isLoading?: boolean;
}

function MetricCard({ val, label, valClassName, isLoading }: MetricCardProps) {
  return (
    <div
      className={twMerge(
        "bg-neutral-900 p-6 rounded-lg border border-neutral-800 text-center",
        isLoading && "animate-pulse",
      )}
    >
      <p className={twMerge("text-3xl font-bold", valClassName)}>
        {isLoading ? <>&nbsp;</> : val}
      </p>
      <p className="text-gray-400">{isLoading ? <>&nbsp;</> : label}</p>
    </div>
  );
}
