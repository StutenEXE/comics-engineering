import { useState, type ReactNode } from "react";
import { MdAutoStories, MdMenuBook } from "react-icons/md";
import { PiFileTextBold } from "react-icons/pi";
import { MonthlyBarChart } from "~/components/misc/MonthlyBarChart";
import { SegmentedControl } from "~/components/misc/SegmentedControl";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import {
  ProgressStatisticCard,
  StatisticCard,
  StatisticSection,
} from "~/components/templates/StatisticPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import {
  useCollectionMonthlyReadingStatsQuery,
  useCollectionReadingStatsQuery,
} from "~/store/services/api";
import { formatCurrency } from "~/utils/currency";
import { convertToDistance } from "~/utils/strings";
import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Reading Stats` },
    { name: "description", content: `Summary and details of your reading` },
  ];
}

export default function StashReadingPage() {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionReadingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const stats = data?.stats;
  const isLoading = isFetching && !stats;
  const eur = (amount?: number) => formatCurrency(amount ?? 0, "EUR", locale);
  const nb = (n?: number) => (n ?? 0).toLocaleString(locale);

  const booksRead = stats?.totalBooksRead ?? 0;
  const booksNotRead = stats?.totalBooksNotRead ?? 0;
  const issuesRead = stats?.totalIssuesRead ?? 0;
  const issuesNotRead = stats?.totalIssuesNotRead ?? 0;
  const pagesRead = stats?.totalPagesRead ?? 0;
  const pagesNotRead = stats?.totalPagesNotRead ?? 0;

  return (
    <SideContentTemplate title={t("stash.reading")}>
      {/* Progress through the collection */}
      <StatisticSection
        title={t("stash.overview")}
        className="grid-cols-1 md:grid-cols-3"
      >
        <ProgressStatisticCard
          icon={MdMenuBook}
          title={t("stash.reading.totalBooks")}
          value={booksRead}
          total={booksRead + booksNotRead}
          valueLabel={`${nb(booksRead)} / ${nb(booksRead + booksNotRead)}`}
          additionalInfo={
            <ReadSplit
              read={`${nb(booksRead)} · ${eur(stats?.valueRead)}`}
              notRead={`${nb(booksNotRead)} · ${eur(stats?.valueNotRead)}`}
            />
          }
          isLoading={isLoading}
        />
        <ProgressStatisticCard
          icon={MdAutoStories}
          title={t("stash.reading.totalIssues")}
          value={issuesRead}
          total={issuesRead + issuesNotRead}
          valueLabel={`${nb(issuesRead)} / ${nb(issuesRead + issuesNotRead)}`}
          additionalInfo={
            <ReadSplit read={nb(issuesRead)} notRead={nb(issuesNotRead)} />
          }
          isLoading={isLoading}
        />
        <ProgressStatisticCard
          icon={PiFileTextBold}
          title={t("stash.reading.totalPages")}
          value={pagesRead}
          total={pagesRead + pagesNotRead}
          valueLabel={`${nb(pagesRead)} / ${nb(pagesRead + pagesNotRead)}`}
          additionalInfo={
            <ReadSplit
              read={`${nb(pagesRead)} · ${convertToDistance(stats?.distanceRead ?? 0)}`}
              notRead={`${nb(pagesNotRead)} · ${convertToDistance(stats?.distanceNotRead ?? 0)}`}
            />
          }
          isLoading={isLoading}
        />
      </StatisticSection>

      {/* Readings per month */}
      <ReadingPerMonthChart />
    </SideContentTemplate>
  );
}

// Read / still to read values under a progress bar
function ReadSplit({ read, notRead }: { read: ReactNode; notRead: ReactNode }) {
  const { t } = useTranslation();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 tabular-nums">
      <dt className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-stash-400/80" aria-hidden />
        {t("stash.reading.read")}
      </dt>
      <dd className="text-right text-white/60">{read}</dd>
      <dt className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-white/15" aria-hidden />
        {t("stash.reading.notRead")}
      </dt>
      <dd className="text-right text-white/60">{notRead}</dd>
    </dl>
  );
}

type ReadingPerMonthChartMode = "book" | "issue" | "page";

function ReadingPerMonthChart() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);
  const [mode, setMode] = useState<ReadingPerMonthChartMode>("book");

  const { data, isFetching } = useCollectionMonthlyReadingStatsQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const nBooksWithoutDate = data?.stats?.nBooksReadWithNoDate ?? 0;

  const months = Object.entries(data?.stats?.readingPerMonth ?? {}).map(
    ([month, monthStats]) => ({
      month,
      values: {
        book: monthStats.numberOfBooksRead,
        issue: monthStats.numberOfIssuesRead,
        page: monthStats.numberOfPagesRead,
      },
    }),
  );

  const labels: Record<ReadingPerMonthChartMode, string> = {
    book: t("stash.reading.totalBooksRead"),
    issue: t("stash.reading.totalIssuesRead"),
    page: t("stash.reading.totalPagesRead"),
  };

  return (
    <StatisticCard
      title={t("stash.reading.readingPerMonth")}
      actions={
        <SegmentedControl
          label={t("stash.reading.dataToShow")}
          value={mode}
          onChange={setMode}
          options={[
            { label: t("stash.reading.books"), value: "book" },
            { label: t("stash.reading.issues"), value: "issue" },
            { label: t("stash.reading.pages"), value: "page" },
          ]}
        />
      }
    >
      <MonthlyBarChart
        data={months}
        isLoading={isFetching && !data}
        series={[{ key: mode, label: labels[mode], color: "var(--chart-1)" }]}
      />
      {/* These books can't be placed on the chart */}
      {nBooksWithoutDate > 0 && (
        <p className="text-xs text-white/35">
          {t("stash.reading.booksReadWithoutADate", {
            parameters: { nbooks: nBooksWithoutDate },
          })}
        </p>
      )}
    </StatisticCard>
  );
}
