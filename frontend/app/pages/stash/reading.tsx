import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartTooltipContentWithTotal } from "~/components/misc/ChartTooltipContentWithTotal";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "~/components/shadcn/ui/chart";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import {
  EmptyStatisticCard,
  NumericalStatisticCard,
  StatisticCard,
  StatisticPageTemplate,
} from "~/components/templates/StatisticPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionMonthlyReadingStatsQuery,
  useCollectionReadingStatsQuery,
} from "~/store/services/api";
import { formatCurrency } from "~/utils/currency";
import { dateToShortMonthYearString } from "~/utils/date";
import { convertToDistance } from "~/utils/strings";
import type { Route } from "../../+types/root";
import { SelectInput } from "~/components/forms/fields/SelectInput";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Reading Stats` },
    { name: "description", content: `Summary and details of your reading` },
  ];
}

export default function StashBookshelfPage() {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionReadingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const stats = data?.stats;

  const totalBooks =
    (stats?.totalBooksRead ?? 0) + (stats?.totalBooksNotRead ?? 0);
  const totalIssues =
    (stats?.totalIssuesRead ?? 0) + (stats?.totalIssuesNotRead ?? 0);
  const totalPages =
    (stats?.totalPagesRead ?? 0) + (stats?.totalPagesNotRead ?? 0);

  return (
    <SideContentTemplate title={t("stash.reading")}>
      <StatisticPageTemplate>
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalBooksRead")}
          value={stats?.totalBooksRead}
          additionalInfo={t("stash.reading.totalBooksRead.info", {
            parameters: {
              amount: formatCurrency(stats?.valueRead ?? 0, "EUR", locale),
            },
          })}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalIssuesRead")}
          value={stats?.totalIssuesRead}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalPagesRead")}
          value={stats?.totalPagesRead}
          additionalInfo={t("stash.reading.totalPagesRead.info", {
            parameters: {
              // Convert to km
              distance: convertToDistance(stats?.distanceRead ?? 0),
            },
          })}
        />
        {/* Readings per month */}
        <StatisticCard
          colSpan={3}
          rowSpan={4}
          title={t("stash.reading.readingPerMonth")}
        >
          <ReadingPerMonthChart />
        </StatisticCard>
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalBooksToRead")}
          value={stats?.totalBooksNotRead}
          additionalInfo={t("stash.reading.totalBooksToRead.info", {
            parameters: {
              amount: formatCurrency(stats?.valueNotRead ?? 0, "EUR", locale),
            },
          })}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalIssuesToRead")}
          value={stats?.totalIssuesNotRead}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalPagesToRead")}
          value={stats?.totalPagesNotRead}
          additionalInfo={t("stash.reading.totalPagesToRead.info", {
            parameters: {
              // Convert to km
              distance: convertToDistance(stats?.distanceNotRead ?? 0),
            },
          })}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.proportionReadByBook")}
          value={`${(((stats?.totalBooksRead ?? 0) / totalBooks) * 100).toFixed(2)}%`}
          additionalInfo={t("stash.reading.proportionReadByBook.info", {
            parameters: {
              read: stats?.totalBooksRead,
              total: totalBooks,
            },
          })}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.proportionReadByIssue")}
          value={`${(((stats?.totalIssuesRead ?? 0) / totalIssues) * 100).toFixed(2)}%`}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.proportionReadByPage")}
          value={`${(((stats?.totalPagesRead ?? 0) / totalPages) * 100).toFixed(2)}%`}
          additionalInfo={t("stash.reading.proportionReadByPage.info", {
            parameters: {
              read: stats?.totalPagesRead,
              total: totalPages,
            },
          })}
        />
      </StatisticPageTemplate>
    </SideContentTemplate>
  );
}

interface ReadingPerMonthChartProps {}

type ReadingPerMonthChartMode = "book" | "issue" | "page";

function ReadingPerMonthChart({}: ReadingPerMonthChartProps) {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionMonthlyReadingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );

  const readingPerMonth = Object.entries(data?.stats?.readingPerMonth ?? {})
    // Convert datestring to date
    .map(([month, monthStats]) => ({
      month: new Date(month),
      numberOfBooksRead: monthStats.numberOfBooksRead,
      numberOfIssuesRead: monthStats.numberOfIssuesRead,
      numberOfPagesRead: monthStats.numberOfPagesRead,
    }))
    // Sort by date
    .sort((a, b) => a.month.getTime() - b.month.getTime());

  // Fill in empty months between first and last month
  const chartData = (() => {
    if (readingPerMonth.length === 0) return [];

    const firstMonth = readingPerMonth[0].month;
    const lastMonth = new Date();
    const filledData = [];

    // Iterate on all the months
    for (
      let d = new Date(firstMonth);
      d <= lastMonth;
      d.setMonth(d.getMonth() + 1)
    ) {
      // Find month data
      const existing = readingPerMonth.find(
        (item) =>
          item.month.getFullYear() === d.getFullYear() &&
          item.month.getMonth() === d.getMonth(),
      );

      // If month data exists, assign foudn values. If not found, assign empty values
      filledData.push({
        month: dateToShortMonthYearString(locale, new Date(d)),
        booksRead: existing?.numberOfBooksRead ?? 0,
        issuesRead: existing?.numberOfIssuesRead ?? 0,
        pagesRead: existing?.numberOfPagesRead ?? 0,
      });
    }
    return filledData;
  })();

  // Config for the chart, mapping data keys to labels and colors
  const chartConfig = {
    booksRead: {
      label: t("stash.reading.totalBooksRead"),
      color: "blue",
    },
    issuesRead: {
      label: t("stash.reading.totalIssuesRead"),
      color: "blue",
    },
    pagesRead: {
      label: t("stash.reading.totalPagesRead"),
      color: "blue",
    },
  } satisfies ChartConfig;

  const [mode, setMode] = useState<ReadingPerMonthChartMode>("book");

  return (
    <>
      <div className="flex my-2 gap-2 items-center">
        <SelectInput
          placeholder={t("stash.reading.dataToShow")}
          defaultValue="book"
          options={[
            { label: t("stash.reading.totalBooks"), value: "book" },
            { label: t("stash.reading.totalIssues"), value: "issue" },
            { label: t("stash.reading.totalPages"), value: "page" },
          ]}
          onValueChange={(v) => setMode(v as ReadingPerMonthChartMode)}
        />
        <p className="text-sm text-muted-foreground">
          {t("stash.reading.booksReadWithoutADate", {
            parameters: { nbooks: data?.stats?.nBooksReadWithNoDate },
          })}
        </p>
      </div>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <YAxis />
          <XAxis
            dataKey="month"
            tickLine={true}
            tickMargin={10}
            axisLine={true}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={1}
          />
          <ChartTooltip content={<ChartTooltipContentWithTotal />} />
          <ChartLegend content={<ChartLegendContent />} />
          {mode === "book" && (
            <Bar dataKey="booksRead" fill="lightblue" radius={[4, 4, 4, 4]} />
          )}
          {mode === "issue" && (
            <Bar dataKey="issuesRead" fill="lightblue" radius={[4, 4, 4, 4]} />
          )}
          {mode === "page" && (
            <Bar dataKey="pagesRead" fill="lightblue" radius={[4, 4, 4, 4]} />
          )}
        </BarChart>
      </ChartContainer>
    </>
  );
}
