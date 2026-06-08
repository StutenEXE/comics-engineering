import { twMerge } from "tailwind-merge";

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component for loading states
 * Uses shimmer animation for better UX
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        "rounded bg-white/5 border border-white/8 animate-pulse",
        className,
      )}
      aria-busy="true"
      aria-label="Loading"
    />
  );
}

/**
 * Skeleton for image/cover art
 */
export function SkeletonImage({
  className = "w-full aspect-[2/3]",
}: SkeletonProps) {
  return <Skeleton className={className} />;
}

/**
 * Skeleton for text content
 */
export function SkeletonText({
  lines = 1,
  className,}: SkeletonProps & { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={twMerge(
            "h-4 w-full",
            // Last line slightly shorter
            i === lines - 1 && "w-3/4",
            className,
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for a field label + value
 */
export function SkeletonField({
  label,
  labelTooltip,
}: {
  label?: string;
  labelTooltip?: string;
}) {
  return (
    <>
      {label ? (
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/30 whitespace-nowrap">
          {label}
          {labelTooltip && <span>{labelTooltip}</span>}
        </span>
      ) : (
        <Skeleton className="h-3 w-24"/>
      )}
      <Skeleton className="h-4 w-full"/>
    </>
  );
}
