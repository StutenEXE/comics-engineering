import { forwardRef, useImperativeHandle } from "react";
import { useContributionStatsQuery } from "~/store/services/api";
import { ContributionMetrics } from "./ContributionMetrics";

export interface AllContributionMetricsHandle {
  refetch: () => void;
}

interface AllContributionMetricsProps {
  className?: string;
}

export const AllContributionMetrics = forwardRef<
  AllContributionMetricsHandle,
  AllContributionMetricsProps
>(function AllContributionMetrics({ className }, ref) {
  const { data, isLoading, refetch } = useContributionStatsQuery({});
  const stats = data?.stats;

  // Wrapper to call the query's refetch function safely.
  const triggerRefetch = () => refetch?.();

  // Expose the triggerRefetch function via the forwarded ref.
  useImperativeHandle(ref, () => ({ refetch: triggerRefetch }), [
    triggerRefetch,
  ]);

  return (
    <ContributionMetrics
      metrics={stats}
      isLoading={isLoading}
      className={className}
    />
  );
});
