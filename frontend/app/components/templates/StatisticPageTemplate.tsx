import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";
import { Skeleton } from "../misc/Skeleton";

interface StatisticSectionProps {
  title?: string;
  // Ex : a toggle, shown on the right of the title
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Titled group of statistic cards. Layout (grid columns) is given by the caller through className
 */
export function StatisticSection({
  title,
  actions,
  className,
  children,
}: StatisticSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h2 className="text-xs font-medium uppercase tracking-widest text-white/40">
              {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      <div className={twMerge("grid gap-3", className)}>{children}</div>
    </section>
  );
}

interface StatisticCardProps {
  title?: string;
  icon?: IconType;
  // Shown on the right of the title
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function StatisticCard({
  title,
  icon: Icon,
  actions,
  children,
  className,
}: StatisticCardProps) {
  return (
    <div
      className={twMerge(
        "flex min-w-0 flex-col gap-3 rounded-xl border border-white/8 bg-white/3 p-4",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h3 className="flex items-center gap-2 text-sm text-white/50">
              {Icon && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-stash-400/10 text-stash-400">
                  <Icon size={14} aria-hidden />
                </span>
              )}
              {title}
            </h3>
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

interface NumericalStatisticCardProps extends StatisticCardProps {
  value?: ReactNode;
  additionalInfo?: ReactNode;
  // Color of the value, ex : savings in green
  valueClassName?: string;
  isLoading?: boolean;
}

export function NumericalStatisticCard({
  title,
  icon,
  value,
  additionalInfo,
  valueClassName,
  isLoading,
  className,
}: NumericalStatisticCardProps) {
  return (
    <StatisticCard title={title} icon={icon} className={className}>
      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <p
            className={twMerge(
              "text-2xl font-semibold tabular-nums text-white/90 sm:text-3xl",
              valueClassName,
            )}
          >
            {value}
          </p>
          {additionalInfo && (
            <p className="text-xs text-white/40">{additionalInfo}</p>
          )}
        </div>
      )}
    </StatisticCard>
  );
}

interface ProgressStatisticCardProps extends StatisticCardProps {
  value: number;
  total: number;
  // Ex : "120 / 340 read"
  valueLabel?: ReactNode;
  additionalInfo?: ReactNode;
  isLoading?: boolean;
}

/**
 * Shows a part of a total (ex : books read out of all books) as a percentage and a bar
 */
export function ProgressStatisticCard({
  title,
  icon,
  value,
  total,
  valueLabel,
  additionalInfo,
  isLoading,
  className,
}: ProgressStatisticCardProps) {
  // No division by 0 on an empty collection
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <StatisticCard title={title} icon={icon} className={className}>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-2xl font-semibold tabular-nums text-white/90 sm:text-3xl">
              {percent.toFixed(0)}
              <span className="text-lg text-white/40">%</span>
            </p>
            {valueLabel && (
              <p className="text-sm tabular-nums text-white/50">{valueLabel}</p>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            aria-label={title}
            className="h-2 w-full overflow-hidden rounded-full bg-white/8"
          >
            <div
              className="h-full rounded-full bg-stash-400/80 transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          {additionalInfo && (
            <div className="text-xs text-white/40">{additionalInfo}</div>
          )}
        </div>
      )}
    </StatisticCard>
  );
}
