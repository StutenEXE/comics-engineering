import { useState } from "react";
import { FaWallet } from "react-icons/fa6";
import { MdAutoStories } from "react-icons/md";
import { PiPiggyBankBold } from "react-icons/pi";
import { OwnedEditionCard } from "~/components/cards/OwnedEditionCard";
import { MonthlyBarChart } from "~/components/misc/MonthlyBarChart";
import { SegmentedControl } from "~/components/misc/SegmentedControl";
import { Skeleton } from "~/components/misc/Skeleton";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import {
  NumericalStatisticCard,
  StatisticCard,
  StatisticSection,
} from "~/components/templates/StatisticPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleOwnedEdition } from "~/models/ownedEdition";
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
import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Spendings` },
    { name: "description", content: `Summary and details of your spending` },
  ];
}

export default function StashSpendingPage() {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionSpendingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const stats = data?.stats;
  const isLoading = isFetching && !stats;
  const eur = (amount?: number) => formatCurrency(amount ?? 0, "EUR", locale);

  return (
    <SideContentTemplate title={t("stash.spending")}>
      {/* Totals */}
      <StatisticSection
        title={t("stash.overview")}
        className="grid-cols-1 sm:grid-cols-3"
      >
        <NumericalStatisticCard
          icon={FaWallet}
          title={t("stash.spending.totalSpent")}
          value={eur(stats?.totalSpent)}
          additionalInfo={t("stash.spending.totalSpent.info", {
            parameters: {
              purchasePrice: eur(stats?.totalPurchasePrice),
              fees: eur(stats?.totalFees),
            },
          })}
          isLoading={isLoading}
        />
        <NumericalStatisticCard
          icon={MdAutoStories}
          title={t("stash.spending.totalRetailPrice")}
          value={eur(stats?.totalRetailPrice)}
          isLoading={isLoading}
        />
        <NumericalStatisticCard
          icon={PiPiggyBankBold}
          title={t("stash.spending.totalSavings")}
          value={eur(stats?.totalSavings)}
          valueClassName={
            (stats?.totalSavings ?? 0) > 0 ? "text-emerald-400" : undefined
          }
          additionalInfo={t("stash.spending.totalSavings.info", {
            parameters: {
              percentage: (stats?.totalSavingsPercentage ?? 0).toFixed(1),
            },
          })}
          isLoading={isLoading}
        />
      </StatisticSection>

      {/* Spendings per month */}
      <SpendingPerMonthChart />

      {/* Remarkable editions */}
      <StatisticSection
        title={t("stash.highlights")}
        className="grid-cols-2 lg:grid-cols-4"
      >
        <EditionStatisticCard
          title={t("stash.spending.mostExpensive")}
          oedition={stats?.mostCostlyEdition}
          value={t("stash.spending.costed", {
            parameters: { amount: eur(calcCost(stats?.mostCostlyEdition)) },
          })}
          isLoading={isLoading}
        />
        <EditionStatisticCard
          title={t("stash.spending.mostValuable")}
          oedition={stats?.mostValuableEdition}
          value={t("stash.spending.retailsAt", {
            parameters: { amount: eur(stats?.mostValuableEdition?.retailPrice) },
          })}
          isLoading={isLoading}
        />
        <EditionStatisticCard
          title={t("stash.spending.bestDealByPrice")}
          oedition={stats?.bestDealObtainedByPrice}
          value={t("stash.spending.saved", {
            parameters: {
              amount: eur(calcSavings(stats?.bestDealObtainedByPrice)),
            },
          })}
          isLoading={isLoading}
        />
        <EditionStatisticCard
          title={t("stash.spending.bestDealByReduction")}
          oedition={stats?.bestDealObtainedByReduction}
          value={t("stash.spending.ofReduction", {
            parameters: {
              percentage: calcReduction(
                stats?.bestDealObtainedByReduction,
              ).toFixed(1),
            },
          })}
          isLoading={isLoading}
        />
      </StatisticSection>
    </SideContentTemplate>
  );
}

interface EditionStatisticCardProps {
  title: string;
  oedition?: SimpleOwnedEdition;
  value?: string;
  isLoading?: boolean;
}

function EditionStatisticCard({
  title,
  oedition,
  value,
  isLoading,
}: EditionStatisticCardProps) {
  const { t } = useTranslation();

  return (
    <StatisticCard title={title}>
      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="aspect-[2/3] w-full max-w-28 rounded-lg" />
        </div>
      )}
      {!isLoading && !oedition && (
        <p className="py-6 text-center text-sm text-white/30">
          {t("edition.nonefound")}
        </p>
      )}
      {!isLoading && oedition && (
        <div className="flex flex-1 flex-col items-center gap-3">
          <p className="text-center text-sm font-medium text-stash-200/90">
            {value}
          </p>
          <div className="w-full max-w-28">
            <OwnedEditionCard simpleOedition={oedition} />
          </div>
        </div>
      )}
    </StatisticCard>
  );
}

type SpendingPerMonthChartMode = "money" | "book";

function SpendingPerMonthChart() {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);
  const [mode, setMode] = useState<SpendingPerMonthChartMode>("money");

  const { data, isFetching } = useCollectionMonthlySpendingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );

  const months = Object.entries(data?.stats?.spendingPerMonth ?? {}).map(
    ([month, monthStats]) => ({
      month,
      values: {
        purchasePrice: monthStats.totalPurchasePrice,
        fees: monthStats.totalFees,
        booksBought: monthStats.totalBooksBought,
        booksGifted: monthStats.totalBooksGifted,
      },
    }),
  );

  // Axis labels without cents to save space
  const compactEur = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <StatisticCard
      title={t("stash.spending.spendingPerMonth")}
      actions={
        <SegmentedControl
          label={t("stash.reading.dataToShow")}
          value={mode}
          onChange={setMode}
          options={[
            { label: t("stash.spending.money"), value: "money" },
            { label: t("stash.spending.book"), value: "book" },
          ]}
        />
      }
    >
      {mode === "money" ? (
        <MonthlyBarChart
          data={months}
          stacked
          isLoading={isFetching && !data}
          series={[
            {
              key: "purchasePrice",
              label: t("oedition.purchasePrice"),
              color: "var(--chart-1)",
            },
            { key: "fees", label: t("oedition.fees"), color: "var(--chart-2)" },
          ]}
          valueFormatter={(v) => formatCurrency(v, "EUR", locale)}
          axisFormatter={(v) => compactEur.format(v)}
        />
      ) : (
        <MonthlyBarChart
          data={months}
          stacked
          isLoading={isFetching && !data}
          series={[
            {
              key: "booksBought",
              label: t("stash.spending.booksBought"),
              color: "var(--chart-1)",
            },
            {
              key: "booksGifted",
              label: t("stash.spending.booksGifted"),
              color: "var(--chart-2)",
            },
          ]}
        />
      )}
    </StatisticCard>
  );
}
