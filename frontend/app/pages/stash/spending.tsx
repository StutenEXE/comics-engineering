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
import StatisticPageTemplate, {
  NumericalStatisticCard,
  StatisticCard,
} from "~/components/templates/StatisticPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import { useCollectionQuery } from "~/store/services/api";
import { formatCurrency } from "~/utils/currency";
import { dateToMonthYearString } from "~/utils/date";
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

  const { data, isFetching } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const oeditions = data?.ownedEditions;

  const totalPurchasePrice =
    oeditions?.reduce((acc, oe) => acc + (oe.purchasePrice ?? 0), 0) ?? 0;
  const totalFees =
    oeditions?.reduce((acc, oe) => acc + (oe.fees ?? 0), 0) ?? 0;
  const totalSpent = totalPurchasePrice + totalFees;
  const totalCollectionValue =
    oeditions?.reduce((acc, oe) => acc + (oe.retailPrice ?? 0), 0) ?? 0;
  const totalSavings = totalCollectionValue - totalSpent;
  const totalSavingsPercentage = (totalSavings / totalCollectionValue) * 100;

  const mostCostlyEdition = [...(oeditions ?? [])]?.sort(
    (a, b) => b.purchasePrice + b.fees - (a.purchasePrice + a.fees),
  )[0];
  const bestDealObtainedSum = [...(oeditions ?? [])]
    ?.filter((oe) => !oe.gift)
    ?.sort(
      (a, b) =>
        b.retailPrice -
        (b.purchasePrice + b.fees) -
        (a.retailPrice - (a.purchasePrice + a.fees)),
    )[0];
  const mostValuableEdition = [...(oeditions ?? [])]?.sort(
    (a, b) => (b.retailPrice ?? 0) - (a.retailPrice ?? 0),
  )[0];

  /**
   * Calculate spending per month
   * [{ month: "2023-01", totalSpent: 100, totalPurchasePrice: 80, totalFees: 20 }, ...]
   */
  const spendingPerMonthTmp = (oeditions ?? []).reduce(
    (acc, oe) => {
      const month = oe.date.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = {
          month: oe.date,
          totalSpent: 0,
          totalPurchasePrice: 0,
          totalFees: 0,
        };
      }
      acc[month].totalSpent += (oe.purchasePrice ?? 0) + (oe.fees ?? 0);
      acc[month].totalPurchasePrice += oe.purchasePrice ?? 0;
      acc[month].totalFees += oe.fees ?? 0;
      return acc;
    },
    {} as Record<
      string,
      {
        month: Date;
        totalSpent: number;
        totalPurchasePrice: number;
        totalFees: number;
      }
    >,
  );
  const spendingPerMonth = Object.fromEntries(
    Object.entries(spendingPerMonthTmp).sort(([a], [b]) => a.localeCompare(b)),
  );

  return (
    <SideContentTemplate title={t("stash.spending")}>
      <StatisticPageTemplate>
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.spending.totalSpent")}
          value={formatCurrency(totalSpent, "EUR", locale)}
          additionalInfo={t("stash.spending.totalSpent.info", {
            parameters: {
              purchasePrice: formatCurrency(totalPurchasePrice, "EUR", locale),
              fees: formatCurrency(totalFees, "EUR", locale),
            },
          })}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.spending.collectionRetailValue")}
          value={formatCurrency(totalCollectionValue, "EUR", locale)}
        />
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.spending.totalSavings")}
          value={formatCurrency(totalSavings, "EUR", locale)}
          additionalInfo={t("stash.spending.totalSavings.info", {
            parameters: {
              percentage: totalSavingsPercentage.toFixed(2),
            },
          })}
        />
        <StatisticCard
          colSpan={3}
          rowSpan={2}
          title={t("stash.spending.spendingPerMonth")}
        >
          <SpendingPerMonthChart data={Object.values(spendingPerMonth)} />
        </StatisticCard>
        <EditionStatisticCard
          oedition={mostCostlyEdition}
          value={t("stash.spending.costed", {
            parameters: {
              amount: formatCurrency(
                mostCostlyEdition?.purchasePrice ?? 0,
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
          oedition={bestDealObtainedSum}
          value={t("stash.spending.saved", {
            parameters: {
              amount: formatCurrency(
                (bestDealObtainedSum?.retailPrice ?? 0) -
                  (bestDealObtainedSum?.purchasePrice ?? 0) +
                  (bestDealObtainedSum?.fees ?? 0),
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
          oedition={mostValuableEdition}
          value={t("stash.spending.retailsAt", {
            parameters: {
              amount: formatCurrency(
                mostValuableEdition?.retailPrice ?? 0,
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
  oedition?: OwnedEdition;
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
            <OwnedEditionCard oedition={oedition} className="max-w-[100px]" />
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
    month: dateToMonthYearString(locale, d.month),
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
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContentWithTotal hideLabel />} />
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
