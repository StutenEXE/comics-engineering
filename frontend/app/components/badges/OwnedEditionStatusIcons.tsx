import { BookOpen, BookOpenCheck, Gift, Signature } from "lucide-react";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import { toDDmmYYYY } from "~/utils/date";
import { Tooltip } from "../misc/Tooltip";

interface OwnedEditionStatusIconsProps {
  oedition: OwnedEdition;
  className?: string;
}

/**
 * Read / signed / gift status of an owned edition, as plain icons.
 * Signed and gift are only shown when true, read is always shown (dimmed when not read).
 */
export function OwnedEditionStatusIcons({
  oedition,
  className,
}: OwnedEditionStatusIconsProps) {
  const { t, locale } = useTranslation();
  const readLabel = oedition.read
    ? t("oedition.read")
    : t("stash.reading.notRead");

  return (
    <div
      className={twMerge(
        "flex items-center gap-3 text-xs text-white/50",
        className,
      )}
    >
      <StatusIcon label={readLabel}>
        {oedition.read ? (
          <BookOpenCheck size={15} aria-hidden />
        ) : (
          <BookOpen size={15} className="text-white/25" aria-hidden />
        )}
        {oedition.read && oedition.dateRead && (
          <span className="tabular-nums text-white/40">
            {toDDmmYYYY(oedition.dateRead, locale)}
          </span>
        )}
      </StatusIcon>
      {oedition.signed && (
        <StatusIcon label={t("oedition.signed")}>
          <Signature size={15} aria-hidden />
        </StatusIcon>
      )}
      {oedition.gift && (
        <StatusIcon label={t("oedition.gift")}>
          <Gift size={15} aria-hidden />
        </StatusIcon>
      )}
    </div>
  );
}

function StatusIcon({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip
      delay={300}
      content={label}
      trigger={
        <span className="flex items-center gap-1.5">
          {/* Icons are decorative, the label is read instead (the read date stays readable) */}
          <span className="sr-only">{label}</span>
          {children}
        </span>
      }
    />
  );
}
