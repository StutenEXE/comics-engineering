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
  NumericalStatisticCard,
  StatisticCard,
  StatisticPageTemplate,
} from "~/components/templates/StatisticPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleOwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import { useCollectionSpendingStatsQuery } from "~/store/services/api";
import { formatCurrency } from "~/utils/currency";
import { dateToShortMonthYearString } from "~/utils/date";
import type { Route } from "../../+types/root";

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

  /**
   * Calculate spending per month
   * [{ month: Date, totalSpent: 100, totalPurchasePrice: 80, totalFees: 20 }, ...]
   */
  const spendingPerMonth = Object.entries(stats?.spendingPerMonth ?? {}).map(
    ([month, monthStats]) => ({
      month: new Date(month),
      totalPurchasePrice: monthStats.totalPurchasePrice,
      totalFees: monthStats.totalFees,
      totalSpent: monthStats.totalSpent,
    }),
  );

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
        {/* Spendings per month */}
        <StatisticCard
          colSpan={3}
          rowSpan={2}
          title={t("stash.spending.spendingPerMonth")}
        >
          <SpendingPerMonthChart data={spendingPerMonth} />
        </StatisticCard>
        <EditionStatisticCard
          oedition={stats?.mostCostlyEdition}
          value={t("stash.spending.costed", {
            parameters: {
              amount: formatCurrency(
                stats?.mostCostlyEdition?.purchasePrice ?? 0,
                "EUR",
                locale,
              ),
            },
          })}
          colSpan={1}
          rowSpan={1}
          title={t("stash.spending.mostExpensive")}
        />
        <EditionStatisticCard
          oedition={stats?.bestDealObtainedByPrice}
          value={t("stash.spending.saved", {
            parameters: {
              amount: formatCurrency(
                (stats?.bestDealObtainedByPrice?.retailPrice ?? 0) -
                  (stats?.bestDealObtainedByPrice?.purchasePrice ?? 0) +
                  (stats?.bestDealObtainedByPrice?.fees ?? 0),
                "EUR",
                locale,
              ),
            },
          })}
          colSpan={1}
          rowSpan={1}
          title={t("stash.spending.bestDeal")}
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
          rowSpan={1}
          title={t("stash.spending.mostValuable")}
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

interface SpendingPerMonthChartProps {
  data: {
    month: Date;
    totalSpent: number;
    totalPurchasePrice: number;
    totalFees: number;
  }[];
}

function SpendingPerMonthChart({ data }: SpendingPerMonthChartProps) {
  const { t, locale } = useTranslation();

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
  } satisfies ChartConfig;

  // Transform data to the shape expected by recharts
  const chartData = data.map((d) => ({
    month: dateToShortMonthYearString(locale, d.month),
    purchasePrice: d.totalPurchasePrice,
    fees: d.totalFees,
    totalSpent: d.totalSpent,
  }));

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis
          tickFormatter={(value) => formatCurrency(value, "EUR", locale)}
        />
        <XAxis
          dataKey="month"
          tickLine={true}
          tickMargin={10}
          axisLine={true}
        />
        <ChartTooltip content={<ChartTooltipContentWithTotal />} />
        <ChartLegend content={<ChartLegendContent />} />
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
      </BarChart>
    </ChartContainer>
  );
}
