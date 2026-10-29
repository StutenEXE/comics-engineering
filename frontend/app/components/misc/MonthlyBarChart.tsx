import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslation } from "~/i18n/i18n";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "../shadcn/ui/chart";
import { ChartTooltipContentWithTotal } from "./ChartTooltipContentWithTotal";
import { SegmentedControl } from "./SegmentedControl";
import { Skeleton } from "./Skeleton";

export interface MonthlyBarChartSeries {
  key: string;
  label: string;
  // CSS color, ex : var(--chart-1)
  color: string;
}

type ChartRange = "year" | "all";

interface MonthlyBarChartProps {
  // Values of each series by month (any date string inside the month)
  data: { month: string; values: Record<string, number> }[];
  series: MonthlyBarChartSeries[];
  // Stacks the series in a single bar (ex : purchase price + fees)
  stacked?: boolean;
  valueFormatter?: (value: number) => string;
  // Shorter formatter for the Y axis
  axisFormatter?: (value: number) => string;
  isLoading?: boolean;
}

/**
 * Bar chart of monthly values, from the first month with data (or 12 months ago) to the current month.
 * Months without data are shown as empty bars.
 */
export function MonthlyBarChart({
  data,
  series,
  stacked,
  valueFormatter,
  axisFormatter,
  isLoading,
}: MonthlyBarChartProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<ChartRange>("year");

  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Indexed by month for a constant time lookup
    const byMonth = new Map(
      data.map((d) => [dayjs(d.month).format("YYYY-MM"), d.values]),
    );
    const firstDataMonth = dayjs(
      Math.min(...data.map((d) => dayjs(d.month).valueOf())),
    ).startOf("month");
    const now = dayjs().startOf("month");
    const start =
      range === "year" ? now.subtract(11, "month") : firstDataMonth;

    const filled = [];
    for (let d = start; !d.isAfter(now); d = d.add(1, "month")) {
      const values = byMonth.get(d.format("YYYY-MM"));
      filled.push({
        month: d.format("MMM YY"),
        fullMonth: d.format("MMMM YYYY"),
        ...Object.fromEntries(series.map((s) => [s.key, values?.[s.key] ?? 0])),
      });
    }
    return filled;
  }, [data, series, range]);

  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  const hasValues = chartData.some((d) =>
    series.some((s) => (d as Record<string, any>)[s.key] > 0),
  );

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        label={t("stash.chart.range")}
        value={range}
        onChange={setRange}
        options={[
          { label: t("stash.chart.range.year"), value: "year" },
          { label: t("stash.chart.range.all"), value: "all" },
        ]}
        className="self-start"
      />

      {isLoading && <Skeleton className="h-64 w-full rounded-lg sm:h-80" />}

      {!isLoading && !hasValues && (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/10 px-4 text-center text-sm text-white/30 sm:h-80">
          {t("stash.chart.empty")}
        </div>
      )}

      {!isLoading && hasValues && (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full sm:h-80"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={axisFormatter ? 56 : 32}
              allowDecimals={false}
              tickFormatter={axisFormatter}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
              interval="preserveStartEnd"
            />
            <ChartTooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={
                <ChartTooltipContentWithTotal
                  valueFormatter={valueFormatter}
                  showTotal={series.length > 1}
                  labelKey="fullMonth"
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullMonth
                  }
                />
              }
            />
            {/* A legend for a single series repeats the card title */}
            {series.length > 1 && (
              <ChartLegend content={<ChartLegendContent />} />
            )}
            {series.map((s, i) => {
              // Only the top of a stack is rounded
              const isTop = !stacked || i === series.length - 1;
              const radius: [number, number, number, number] = isTop
                ? [4, 4, 0, 0]
                : [0, 0, 0, 0];
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  fill={`var(--color-${s.key})`}
                  stackId={stacked ? "stack" : undefined}
                  radius={radius}
                  maxBarSize={40}
                />
              );
            })}
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
