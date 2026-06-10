import { useContributionStatsBySubmitterIdQuery } from "~/store/services/api";
import { ContributionMetrics } from "./ContributionMetrics";

interface UserContributionMetricsProps {
  userId?: number;
  className?: string;
}

export function UserContributionMetrics({
  userId,
  className,
}: UserContributionMetricsProps) {
  const { data } = useContributionStatsBySubmitterIdQuery(
    { id: userId || 0 },
    { skip: !userId },
  );
  const stats = data?.stats;
  return <ContributionMetrics metrics={stats} className={className} />;
}
