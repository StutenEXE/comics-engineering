import { twMerge } from "tailwind-merge";

interface StatisticPageTemplateProps {
  children: React.ReactNode;
}

export function StatisticPageTemplate({
  children,
}: StatisticPageTemplateProps) {
  // The grid has 6 columns on xl, 3 on sm, 1 on default.
  // Children can be StatisticCard elements which will control their own grid span.
  return (
    <div className="min-h-screen px-4 py-6">
      <main className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-6">
        {children}
      </main>
    </div>
  );
}

interface StatisticCardProps {
  title?: string;
  /**
   * How many columns to span on the xl breakpoint (1..6). Defaults to 1.
   * The card will span the same number on sm (max 2) and default (1).
   */
  colSpan?: number;
  /**
   * How many rows to span. Defaults to 1, constrained to 1..6
   */
  rowSpan?: number;
  className?: string;
  children?: React.ReactNode;
}

export function StatisticCard({
  title,
  children,
  colSpan = 1,
  rowSpan = 1,
  className = "",
}: StatisticCardProps) {
  // Constrain span to 1..6
  const s = Math.max(1, Math.min(6, Math.floor(colSpan)));
  // Constrain row span to 1..6
  const r = Math.max(1, Math.min(6, Math.floor(rowSpan)));

  // Use inline gridColumn style so tailwind doesn't need dynamic classes.
  // On small screens the parent grid has fewer columns; grid-column: span N will adapt.
  const style: React.CSSProperties = {
    gridColumn: `span ${s}`,
    gridRow: `span ${r}`,
  };

  return (
    <div
      style={style}
      className={twMerge(
        "rounded-lg bg-white/5 p-4 shadow-sm border border-white/5 min-h-[72px]",
        className,
      )}
    >
      {title && <h2 className="mb-2 text-sm text-muted-foreground">{title}</h2>}
      {children}
    </div>
  );
}

interface NumericalStatisticCardProps extends StatisticCardProps {
  value: number | string;
  additionalInfo?: string;
}

export function NumericalStatisticCard({
  title,
  value,
  additionalInfo,
  colSpan: span = 1,
  rowSpan = 1,
  className = "",
}: NumericalStatisticCardProps) {
  return (
    <StatisticCard
      title={title}
      colSpan={span}
      rowSpan={rowSpan}
      className={className}
    >
      <p>{value}</p>
      <p className="text-xs text-muted-foreground">{additionalInfo}</p>
    </StatisticCard>
  );
}
