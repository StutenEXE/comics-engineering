import type { ReactNode } from "react";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import type { Error } from "~/utils/error";
import { Separator } from "../shadcn/ui/separator";
import { InfoPageFields, InfoPageSection } from "../templates/InfoPageTemplate";
import { EditionDataDisplay } from "./EditionDataDisplay";
import { insertLinebreaks } from "~/utils/strings";
import { HelpBadgeTooltip } from "../badges/HelpBadge";
import { formatCurrency } from "~/utils/currency";

interface OwnedEditionDataDisplayProps {
  oedition?: OwnedEdition;
  onEditClick?: () => void;
  isLoading?: boolean;
  error?: Error;
  className?: string;
  children?: ReactNode;
}

export function OwnedEditionDataDisplay({
  oedition,
  onEditClick,
  isLoading,
  error,
  className,
  children,
}: OwnedEditionDataDisplayProps) {
  const { t, locale } = useTranslation();

  const totalCost = (oedition?.purchasePrice ?? 0) + (oedition?.fees ?? 0);
  const savingsNum = (oedition?.retailPrice ?? 0) - totalCost;
  const savingsPer = (savingsNum * 100) / (oedition?.retailPrice ?? 1);

  return (
    <EditionDataDisplay
      edition={oedition?.edition}
      onEditClick={() => {}}
      isLoading={isLoading}
      error={error}
      className={className}
    >
      <InfoPageFields
        isLoading={isLoading}
        fieldProps={[
          // Date added
          {
            label: t("oedition.addDate"),
            value: oedition?.date.toLocaleDateString(locale),
          },
          // Read & Date read
          {
            label: t("oedition.read"),
            value: (
              <p className="whitespace-nowrap">
                {t(oedition?.read ? "generic.yes" : "generic.no", {
                  capitalize: true,
                })}{" "}
                {oedition?.dateRead && (
                  <span className="text-white/30">
                    ({oedition?.dateRead.toLocaleDateString(locale)})
                  </span>
                )}
              </p>
            ),
          },
          // Signed
          {
            label: t("oedition.signed"),
            value: t(oedition?.signed ? "generic.yes" : "generic.no", {
              capitalize: true,
            }),
          },
          // Gift
          {
            label: t("oedition.gift"),
            value: t(oedition?.gift ? "generic.yes" : "generic.no", {
              capitalize: true,
            }),
          },
        ]}
      />
      <InfoPageSection label={t("oedition.spending")}>
        <div className="text-white/80">
          <table className="w-full">
            {/* Header */}
            <tr>
              <td>{t("oedition.purchasePrice")}</td>
              <td>
                {t("oedition.fees")}{" "}
                <HelpBadgeTooltip
                  tooltipContent={t("oedition.feesExplanation")}
                />
              </td>
              <td>
                {t("oedition.retailPrice")}{" "}
                <HelpBadgeTooltip
                  tooltipContent={t("oedition.feesExplanation")}
                />
              </td>
            </tr>
            {/* User data */}
            <tr className="text-white/60">
              <td>
                {formatCurrency(oedition?.purchasePrice || 0, "EUR", locale)}
              </td>
              <td>{formatCurrency(oedition?.fees || 0, "EUR", locale)}</td>
              <td>
                {formatCurrency(oedition?.retailPrice || 0, "EUR", locale)}
              </td>
            </tr>
          </table>
          {/* Costs */}
          <div>
            {/* Total cost */}
            <p className="whitespace-nowrap">
              {t("oedition.totalCost")} :{" "}
              <span className="text-white/60">
                {formatCurrency(totalCost, "EUR", locale)}
              </span>
            </p>
            {/* Savings (num & percent) */}
            {savingsNum > 0 && (
              <p className="whitespace-nowrap">
                {t("oedition.saved")} :{" "}
                <span className="text-white/60">
                  {formatCurrency(savingsNum || 0, "EUR", locale)} (
                  {t("oedition.saved.percentOfPrice", {
                    parameters: { percent: savingsPer.toFixed(2) },
                  })}
                  )
                </span>
              </p>
            )}
          </div>
        </div>
      </InfoPageSection>
      {/* Note */}
      <InfoPageSection label={t("oedition.note")} isLoading={isLoading}>
        <p className="text-sm text-white/60 leading-relaxed">
          {insertLinebreaks(oedition?.note)}
        </p>
      </InfoPageSection>
      {children}
    </EditionDataDisplay>
  );
}
