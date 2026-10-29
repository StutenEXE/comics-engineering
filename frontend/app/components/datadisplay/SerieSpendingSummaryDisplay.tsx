import { useMemo, type ReactNode } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { Serie } from "~/models/serie";
import { useAppSelector } from "~/store/hooks";
import { useFullCollectionQuery } from "~/store/services/api";
import { summarize } from "~/utils/collection";
import { formatCurrency, savingsClassName } from "~/utils/currency";
import { InfoPageSection } from "../templates/InfoPageTemplate";

interface SerieSpendingSummaryDisplayProps {
  serie?: Serie;
}

/**
 * What the logged user spent and saved on a serie. Hidden when the user owns none of its editions
 */
export function SerieSpendingSummaryDisplay({
  serie,
}: SerieSpendingSummaryDisplayProps) {
  const { t, locale } = useTranslation();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data } = useFullCollectionQuery(
    { userId: user ? user.id : 0 },
    { skip: !isAuthenticated || !user || !serie },
  );

  const summary = useMemo(() => {
    if (!serie || !data) return undefined;
    const owned = data.ownedEditions.filter(
      (oe) => oe.edition.serie?.id === serie.id,
    );
    return owned.length > 0 ? summarize(serie, owned) : undefined;
  }, [serie, data]);

  if (!summary) return null;

  const eur = (amount: number) => formatCurrency(amount, "EUR", locale);
  const ownedPercent =
    serie!.nvolumes > 0
      ? Math.min(100, (summary.nBooks / serie!.nvolumes) * 100)
      : 0;

  return (
    <InfoPageSection label={t("serie.myCollection")}>
      <div className="flex flex-col gap-3 rounded-xl border border-stash-400/15 bg-stash-400/3 p-4">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryItem label={t("stash.prices.serie.owned")}>
            <span className="tabular-nums">
              {summary.nBooks}
              {!serie!.oneshot && (
                <span className="text-white/40"> / {serie!.nvolumes}</span>
              )}
            </span>
            {!serie!.oneshot && (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ownedPercent)}
                aria-label={t("stash.prices.serie.owned")}
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/8"
              >
                <div
                  className="h-full rounded-full bg-stash-400/80"
                  style={{ width: `${ownedPercent}%` }}
                />
              </div>
            )}
          </SummaryItem>
          <SummaryItem
            label={t("oedition.totalCost")}
            detail={`${eur(summary.purchasePrice)} + ${eur(summary.fees)} (${t("oedition.fees").toLowerCase()})`}
          >
            {eur(summary.totalCost)}
          </SummaryItem>
          <SummaryItem label={t("oedition.retailPrice")}>
            {eur(summary.retailPrice)}
          </SummaryItem>
          <SummaryItem
            label={t("oedition.saved")}
            detail={
              summary.retailPrice > 0
                ? t("oedition.saved.percentOfPrice", {
                    parameters: { percent: summary.reduction.toFixed(1) },
                  })
                : undefined
            }
            valueClassName={savingsClassName(summary.savings)}
          >
            {eur(summary.savings)}
          </SummaryItem>
        </dl>
        <Link
          to="/stash/prices?view=serie"
          className="self-start text-xs text-stash-200/70 hover:text-stash-200 hover:underline"
        >
          {t("serie.myCollection.seeAll")}&nbsp;↗
        </Link>
      </div>
    </InfoPageSection>
  );
}

function SummaryItem({
  label,
  detail,
  valueClassName,
  children,
}: {
  label: string;
  detail?: string;
  valueClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd
        className={twMerge(
          "text-lg font-semibold tabular-nums text-white/90",
          valueClassName,
        )}
      >
        {children}
      </dd>
      {detail && <dd className="text-xs text-white/35">{detail}</dd>}
    </div>
  );
}
