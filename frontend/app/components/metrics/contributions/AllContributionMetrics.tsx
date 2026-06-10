import { useContributionStatsQuery } from "~/store/services/api";
import { ContributionMetrics } from "./ContributionMetrics";
import { forwardRef, useEffect, useImperativeHandle } from "react";

/**
 * Public handle exposed to parent components through ref forwarding.
 * Allows consumers to trigger a manual refetch of contribution metrics.
 */
export interface AllContributionMetricsHandle {
  refetch: () => void;
}

interface AllContributionMetricsProps {
  className?: string;
}

/**
 * Component that fetches contribution metrics and renders them.
 * Supports ref forwarding and optional callback-based exposure of the refetch function.
 */
export const AllContributionMetrics = forwardRef<
  AllContributionMetricsHandle,
  AllContributionMetricsProps
>(function AllContributionMetrics({ className }, ref) {
  const { data, refetch } = useContributionStatsQuery({});
  const stats = data?.stats;

  // Wrapper to call the query's refetch function safely.
  const triggerRefetch = () => refetch?.();

  // Expose the triggerRefetch function via the forwarded ref.
  useImperativeHandle(ref, () => ({ refetch: triggerRefetch }), [
    triggerRefetch,
  ]);

  return <ContributionMetrics metrics={stats} className={className} />;
});
