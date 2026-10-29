import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import { useFullCollectionQuery } from "~/store/services/api";
import { summarizeBySerie, type SerieSpendingSummary } from "~/utils/collection";
import { formatCurrency, savingsClassName } from "~/utils/currency";
import { createError } from "~/utils/error";
import { GenericTable } from "./GenericTable";

interface SeriePricesTableProps {
  className?: string;
}

/**
 * Total cost and savings of the collection, by serie
 */
export function SeriePricesTable({}: SeriePricesTableProps) {
  const { t, locale } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  // Totals are computed from the whole collection (shared cache with the editions prices table)
  const { data, isFetching, error } = useFullCollectionQuery(
    { userId: user ? user.id : 0 },
    { skip: !user },
  );
  const err = createError(error);

  // Most expensive series first
  const summaries = useMemo(
    () =>
      summarizeBySerie(data?.ownedEditions ?? []).sort(
        (a, b) => b.totalCost - a.totalCost,
      ),
    [data],
  );

  const eur = (amount: number) => formatCurrency(amount, "EUR", locale);
  const volumes = (s: SerieSpendingSummary) =>
    s.serie.oneshot
      ? t("serie.oneshot")
      : `${s.nBooks} / ${s.serie.nvolumes} ${t("generic.volumes")}`;

  const col = createColumnHelper<SerieSpendingSummary>();
  const columns = useMemo(
    () => [
      // Serie name
      col.accessor("serie.name", {
        id: "serieName",
        header: t("oedition.serie.name"),
        meta: { filterType: "text" },
        cell: (info) => (
          <Link
            className="hover:underline"
            to={`/serie/${info.row.original.serie.id}`}
          >
            {info.getValue()}&nbsp;<span className="font-normal">↗</span>
          </Link>
        ),
      }),
      // Owned volumes
      col.accessor("nBooks", {
        header: t("stash.prices.serie.owned"),
        enableColumnFilter: false,
        cell: (info) => volumes(info.row.original),
      }),
      // Total cost
      col.accessor("totalCost", {
        header: t("stash.prices.cost"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <div>
            <p className="font-medium text-white/85">{eur(info.getValue())}</p>
            <p className="text-xs text-white/40">
              ({eur(info.row.original.purchasePrice)}
              &nbsp;+&nbsp;
              {eur(info.row.original.fees)})
            </p>
          </div>
        ),
      }),
      // Retail price
      col.accessor("retailPrice", {
        header: t("oedition.retailPrice"),
        meta: { filterType: "numrange" },
        cell: (info) => eur(info.getValue()),
      }),
      // Savings (€)
      col.accessor("savings", {
        header: t("stash.prices.savings.value"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <span className={savingsClassName(info.getValue())}>
            {eur(info.getValue())}
          </span>
        ),
      }),
      // Reduction (%)
      col.accessor("reduction", {
        header: t("stash.prices.savings.reduction"),
        meta: { filterType: "numrange" },
        cell: (info) => (
          <span className={savingsClassName(info.getValue())}>
            {info.getValue().toFixed(2)}%
          </span>
        ),
      }),
    ],
    [col, t, locale],
  );

  return (
    <GenericTable
      list={summaries}
      columns={columns}
      isLoading={isFetching && !data}
      error={err}
      renderCard={(s) => (
        <div className="flex flex-col gap-2 px-3 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <Link
              to={`/serie/${s.serie.id}`}
              className="min-w-0 truncate text-sm font-medium text-white/85 hover:underline"
            >
              {s.serie.name}
            </Link>
            <span className="shrink-0 text-xs tabular-nums text-white/40">
              {volumes(s)}
            </span>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt className="text-white/35">{t("stash.prices.cost")}</dt>
              <dd className="tabular-nums text-white/85">
                {eur(s.totalCost)}
              </dd>
            </div>
            <div>
              <dt className="text-white/35">{t("oedition.retailPrice")}</dt>
              <dd className="tabular-nums text-white/70">
                {eur(s.retailPrice)}
              </dd>
            </div>
            <div>
              <dt className="text-white/35">
                {t("stash.prices.savings.value")}
              </dt>
              <dd
                className={`tabular-nums ${savingsClassName(s.savings) || "text-white/70"}`}
              >
                {eur(s.savings)}
                {s.retailPrice > 0 && (
                  <span className="ml-1 opacity-70">
                    ({s.reduction.toFixed(0)}%)
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      )}
    />
  );
}
