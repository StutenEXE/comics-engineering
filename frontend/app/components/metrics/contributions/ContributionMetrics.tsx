import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";

interface ContributionMetricsProps {
  metrics?: ContributionsStats;
  className?: string;
}

export function ContributionMetrics({
  metrics,
  className,
}: ContributionMetricsProps) {
  const { t } = useTranslation();

  if (!metrics) return null;

  return (
    <div className={twMerge("flex flex-col gap-6", className)}>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-3xl font-bold text-blue-400">{metrics?.total}</p>
          <p className="text-gray-400">{t("contribution.stats.total")}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-3xl font-bold text-green-400">
            {metrics?.status.approved.total}
          </p>
          <p className="text-gray-400">{t("contribution.stats.approved")}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-3xl font-bold text-yellow-400">
            {metrics?.status.pending.total}
          </p>
          <p className="text-gray-400">{t("contribution.stats.pending")}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-3xl font-bold text-purple-400">
            {metrics?.status.needs_revision.total}
          </p>
          <p className="text-gray-400">
            {t("contribution.stats.needsRevision")}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-3xl font-bold text-red-400">
            {metrics?.status.rejected.total}
          </p>
          <p className="text-gray-400">{t("contribution.stats.rejected")}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
          <p className="text-3xl font-bold text-gray-400">
            {metrics?.status.rejected.total}
          </p>
          <p className="text-gray-400">{t("contribution.stats.skipped")}</p>
        </div>
      </div>
    </div>
  );
}
