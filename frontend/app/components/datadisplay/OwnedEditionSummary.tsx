import type { ReactNode } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import {
  calcCost,
  calcReduction,
  calcSavings,
  formatCurrency,
} from "~/utils/currency";
import { toDDmmYYYY } from "~/utils/date";
import { insertLinebreaks } from "~/utils/strings";
import { OwnedEditionStatusIcons } from "../badges/OwnedEditionStatusIcons";

interface OwnedEditionSummaryProps {
  oedition: OwnedEdition;
  // Ex : open the full details
  actions?: ReactNode;
  className?: string;
}

/**
 * Compact owned edition details, fits in a side panel or a bottom sheet
 */
export function OwnedEditionSummary({
  oedition,
  actions,
  className,
}: OwnedEditionSummaryProps) {
  const { t, locale } = useTranslation();
  const { edition } = oedition;
  const eur = (amount: number) => formatCurrency(amount, "EUR", locale);
  const savings = calcSavings(oedition);

  return (
    <div className={twMerge("flex flex-col gap-5", className)}>
      {/* Cover & titles */}
      <div className="flex gap-4">
        <img
          src={edition.imgUrl || "/placeholder.jpg"}
          alt={edition.book?.name}
          className="w-24 shrink-0 self-start rounded-lg border border-white/8 object-cover shadow-lg shadow-black/40 aspect-[2/3]"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <Link
            to={`/book/${edition.book?.id}`}
            className="text-base font-medium leading-snug text-white/90 hover:underline"
          >
            {edition.book?.name}
          </Link>
          {edition.serie && (
            <Link
              to={`/serie/${edition.serie.id}`}
              className="text-sm text-indigo-300/70 hover:text-indigo-300 hover:underline"
            >
              {edition.serie.name}
              {edition.book?.number && !edition.serie.oneshot && (
                <> · {t("generic.volume", { capitalize: true })} {edition.book.number}</>
              )}
            </Link>
          )}
          <p className="text-xs text-white/40">
            {[
              edition.publisher?.name,
              edition.parutionDate && toDDmmYYYY(edition.parutionDate, locale),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {/* Status */}
          <OwnedEditionStatusIcons oedition={oedition} className="mt-1" />
        </div>
      </div>

      {/* Prices */}
      <dl className="grid grid-cols-3 gap-2 rounded-lg border border-white/8 bg-white/3 p-3 text-center">
        <PriceItem label={t("oedition.totalCost")} value={eur(calcCost(oedition))} />
        <PriceItem
          label={t("oedition.retailPrice")}
          value={eur(oedition.retailPrice)}
        />
        <PriceItem
          label={t("oedition.saved")}
          value={eur(savings)}
          detail={savings > 0 ? `-${calcReduction(oedition).toFixed(0)}%` : undefined}
          valueClassName={savings > 0 ? "text-emerald-400" : undefined}
        />
      </dl>

      <p className="text-xs text-white/40">
        {t("oedition.addDate")} :{" "}
        <span className="text-white/60">{toDDmmYYYY(oedition.date, locale)}</span>
      </p>

      {/* Note */}
      {oedition.note && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("oedition.note")}
          </span>
          <p className="text-sm leading-relaxed text-white/60">
            {insertLinebreaks(oedition.note)}
          </p>
        </div>
      )}

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function PriceItem({
  label,
  value,
  detail,
  valueClassName,
}: {
  label: string;
  value: string;
  detail?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="truncate text-[11px] uppercase tracking-wider text-white/35">
        {label}
      </dt>
      <dd
        className={twMerge(
          "text-sm font-medium tabular-nums text-white/85",
          valueClassName,
        )}
      >
        {value}
        {detail && (
          <span className="block text-[11px] font-normal">{detail}</span>
        )}
      </dd>
    </div>
  );
}
