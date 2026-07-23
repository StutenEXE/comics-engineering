import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { OwnedEditionCard } from "~/components/cards/OwnedEditionCard";
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
import type { OwnedEdition, SimpleOwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionMonthlySpendingStatsQuery,
  useCollectionSpendingStatsQuery,
} from "~/store/services/api";
import {
  calcCost,
  calcReduction,
  calcSavings,
  formatCurrency,
} from "~/utils/currency";
import { compareDates, dateToShortMonthYearString } from "~/utils/date";
import type { Route } from "../../+types/root";
import { SelectInput } from "~/components/forms/fields/SelectInput";
import { useState } from "react";
import dayjs from "dayjs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Spendings` },
    { name: "description", content: `Summary and details of your spending` },
  ];
}

export default function StashBookshelfPage() {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionSpendingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const stats = data?.stats;

  return (
    <SideContentTemplate title={t("stash.spending")}>
      <StatisticPageTemplate>
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.spending.totalSpent")}
          value={formatCurrency(stats?.totalSpent ?? 0, "EUR", locale)}
          additionalInfo={t("stash.spending.totalSpent.info", {
            parameters: {
              purchasePrice: formatCurrency(
                stats?.totalPurchasePrice ?? 0,
                "EUR",
                locale,
              ),
              fees: formatCurrency(stats?.totalFees ?? 0, "EUR", locale),
            },
          })}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.spending.totalRetailPrice")}
          value={formatCurrency(stats?.totalRetailPrice ?? 0, "EUR", locale)}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.spending.totalSavings")}
          value={formatCurrency(stats?.totalSavings ?? 0, "EUR", locale)}
          additionalInfo={t("stash.spending.totalSavings.info", {
            parameters: {
              percentage: stats?.totalSavingsPercentage.toFixed(2),
            },
          })}
        />
        <EmptyStatisticCard colSpan={1} />
        <EditionStatisticCard
          oedition={stats?.mostCostlyEdition}
          value={t("stash.spending.costed", {
            parameters: {
              amount: formatCurrency(
                calcCost(stats?.mostCostlyEdition),
                "EUR",
                locale,
              ),
            },
          })}
          colSpan={1}
          rowSpan={2}
          title={t("stash.spending.mostExpensive")}
        />
        <EditionStatisticCard
          oedition={stats?.mostValuableEdition}
          value={t("stash.spending.retailsAt", {
            parameters: {
              amount: formatCurrency(
                stats?.mostValuableEdition?.retailPrice ?? 0,
                "EUR",
                locale,
              ),
            },
          })}
          colSpan={1}
          rowSpan={2}
          title={t("stash.spending.mostValuable")}
        />
        {/* Spendings per month */}
        <StatisticCard
          colSpan={4}
          rowSpan={2}
          title={t("stash.spending.spendingPerMonth")}
        >
          <SpendingPerMonthChart />
        </StatisticCard>

        <EditionStatisticCard
          oedition={stats?.bestDealObtainedByPrice}
          value={t("stash.spending.saved", {
            parameters: {
              amount: formatCurrency(
                calcSavings(stats?.bestDealObtainedByPrice),
                "EUR",
                locale,
              ),
            },
          })}
          colSpan={1}
          rowSpan={2}
          title={t("stash.spending.bestDealByPrice")}
        />
        <EditionStatisticCard
          oedition={stats?.bestDealObtainedByReduction}
          value={t("stash.spending.ofReduction", {
            parameters: {
              percentage: calcReduction(
                stats?.bestDealObtainedByReduction,
              ).toFixed(2),
            },
          })}
          colSpan={1}
          rowSpan={2}
          title={t("stash.spending.bestDealByReduction")}
        />
      </StatisticPageTemplate>
    </SideContentTemplate>
  );
}

interface EditionStatisticCardProps {
  title: string;
  oedition?: SimpleOwnedEdition;
  value?: string | number;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

function EditionStatisticCard({
  title,
  oedition,
  value,
  colSpan = 1,
  rowSpan = 1,
  className = "",
}: EditionStatisticCardProps) {
  const { t } = useTranslation();

  return (
    <StatisticCard
      colSpan={colSpan}
      rowSpan={rowSpan}
      title={title}
      className={className}
    >
      <div className="flex flex-col items-center gap-3">
        {!oedition && (
          <p className="text-muted-foreground">{t("edition.nonefound")}</p>
        )}
        {oedition && (
          <>
            <p className="text-sm whitespace-nowrap">{value}</p>
            <OwnedEditionCard
              simpleOedition={oedition}
              className="max-w-[100px]"
            />
          </>
        )}
      </div>
    </StatisticCard>
  );
}

interface SpendingPerMonthChartProps {}

type SpendingPerMonthChartMode = "money" | "book";

function SpendingPerMonthChart({}: SpendingPerMonthChartProps) {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionMonthlySpendingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );

  const spendingPerMonth = Object.entries(data?.stats?.spendingPerMonth ?? {})
    // Convert datestring to date
    .map(([month, monthStats]) => ({
      month: month,
      totalPurchasePrice: monthStats.totalPurchasePrice,
      totalFees: monthStats.totalFees,
      totalSpent: monthStats.totalSpent,
      totalBooksBought: monthStats.totalBooksBought,
      totalBooksGifted: monthStats.totalBooksGifted,
      totalBooksAdded: monthStats.totalBooksAdded,
    }))
    // Sort by date
    .sort((a, b) => compareDates(a.month, b.month));
  // Fill in empty months between first and last month
  const chartData = (() => {
    if (spendingPerMonth.length === 0) return [];

    const firstMonth = spendingPerMonth[0].month;
    const lastMonth = dayjs();
    const filledData = [];

    // Iterate on all the months
    for (
      let d = dayjs(firstMonth);
      d.valueOf() <= lastMonth.valueOf();
      d = d.add(1, "month")
    ) {
      // Find month data
      const existing = spendingPerMonth.find(
        (item) =>
          dayjs(item.month).year() === dayjs(d).year() &&
          dayjs(item.month).month() === dayjs(d).month(),
      );

      // If month data exists, assign foudn values. If not found, assign empty values
      filledData.push({
        month: dateToShortMonthYearString(locale, d.format()),
        purchasePrice: existing?.totalPurchasePrice ?? 0,
        fees: existing?.totalFees ?? 0,
        totalSpent: existing?.totalSpent ?? 0,
        booksBought: existing?.totalBooksBought ?? 0,
        booksGifted: existing?.totalBooksGifted ?? 0,
        booksAdded: existing?.totalBooksAdded ?? 0,
      });
    }
    return filledData;
  })();

  // Config for the chart, mapping data keys to labels and colors
  const chartConfig = {
    purchasePrice: {
      label: t("oedition.purchasePrice"),
      color: "blue",
    },
    fees: {
      label: t("oedition.fees"),
      color: "lightblue",
    },
    booksBought: {
      label: t("stash.spending.booksBought"),
      color: "blue",
    },
    booksGifted: {
      label: t("stash.spending.booksGifted"),
      color: "lightblue",
    },
  } satisfies ChartConfig;

  const [mode, setMode] = useState<SpendingPerMonthChartMode>("money");

  return (
    <>
      <div className="my-2">
        <SelectInput
          placeholder={t("stash.reading.dataToShow")} // Reading i18n ref here
          defaultValue="money"
          options={[
            { label: t("stash.spending.money"), value: "money" },
            { label: t("stash.spending.book"), value: "book" },
          ]}
          onValueChange={(v) => setMode(v as SpendingPerMonthChartMode)}
        />
      </div>
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <YAxis
            tickFormatter={(value) =>
              mode === "money" ? formatCurrency(value, "EUR", locale) : value
            }
          />
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
          {mode === "money" && (
            <>
              <Bar
                dataKey="purchasePrice"
                stackId="a"
                fill="blue"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="fees"
                stackId="a"
                fill="lightblue"
                radius={[4, 4, 0, 0]}
              />
            </>
          )}
          {mode === "book" && (
            <>
              <Bar
                dataKey="booksBought"
                stackId="a"
                fill="blue"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="booksGifted"
                stackId="a"
                fill="lightblue"
                radius={[4, 4, 0, 0]}
              />
            </>
          )}
        </BarChart>
      </ChartContainer>
    </>
  );
}
