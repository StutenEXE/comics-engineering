import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import {
  EmptyStatisticCard,
  NumericalStatisticCard,
  StatisticPageTemplate,
} from "~/components/templates/StatisticPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import type { Route } from "../../+types/root";
import {
  useCollectionReadingStatsQuery,
  useCollectionSpendingStatsQuery,
} from "~/store/services/api";
import { convertToDistance } from "~/utils/strings";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Reading` },
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
  const totalPages =
    (stats?.totalPagesRead ?? 0) + (stats?.totalPagesNotRead ?? 0);

  console.log(
    stats?.totalBooksRead,
    totalBooks,
    (((stats?.totalBooksRead ?? 0) / totalBooks) * 100).toFixed(2),
  );

  return (
    <SideContentTemplate title={t("stash.reading")}>
      <StatisticPageTemplate>
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalBooksRead")}
          value={stats?.totalBooksRead}
          additionalInfo={t("stash.reading.totalBooksRead.info")}
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
        <EmptyStatisticCard colSpan={4} rowSpan={3}></EmptyStatisticCard>
        <NumericalStatisticCard
          colSpan={1}
          title={t("stash.reading.totalBooksToRead")}
          value={stats?.totalBooksNotRead}
          additionalInfo={t("stash.reading.totalBooksToRead.info")}
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
