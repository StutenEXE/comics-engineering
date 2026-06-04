import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import type { Error } from "~/utils/error";
import { HelpBadgeTooltip } from "../badges/HelpBadge";
import { GenericPageTemplate } from "./GenericPageTemplate";
import { EnlargeableImage } from "../misc/EnlargeableImage";

interface PageTemplateProps {
  hasImg?: boolean;
  imgUrl?: string;
  imgAlt?: string;
  isLoading?: boolean;
  error?: Error;
  children?: ReactNode;
}

export function InfoPageTemplate({
  hasImg,
  imgUrl,
  imgAlt,
  isLoading,
  error,
  children,
}: PageTemplateProps) {
  const { t } = useTranslation();

  return (
    <GenericPageTemplate>
      <div className="flex gap-8 items-start">
        {hasImg && (
          <div className="w-50 shrink-0 sticky top-24">
            <EnlargeableImage
              src={imgUrl ?? "/placeholder.jpg"}
              alt={imgAlt ?? "placeholder"}
              className="w-full rounded-lg border border-white/8 shadow-xl shadow-black/40 object-cover"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-white/30 animate-pulse">
                {t("loader.loading")}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex flex-col gap-1 py-12">
              <p className="text-sm text-white/40">{t("loader.error")}</p>
              <p className="text-xs text-rose-400/70 font-mono">
                [{error.status}] {error.details.message}
              </p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !error && children}
        </div>
      </div>
    </GenericPageTemplate>
  );
}

export function InfoPageSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </span>
      {children}
    </div>
  );
}

interface InfoPageFieldProps {
  label: string;
  labelTooltip?: string;
  value?: ReactNode;
  to?: string; // internal link
  href?: string; // external link
  hide?: boolean; // skip if no value
}

export function InfoPageField({
  label,
  labelTooltip,
  value,
  to,
  href,
  hide,
}: InfoPageFieldProps) {
  const { t } = useTranslation();

  if (hide) return <></>;

  const displayValue = value ?? t("generic.uknown");

  return (
    <>
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/30 whitespace-nowrap">
        {label}
        {labelTooltip && <HelpBadgeTooltip tooltipContent={labelTooltip} />}
      </span>
      {to ? (
        <Link
          to={to}
          className="text-sm text-indigo-300/70 hover:underline hover:text-indigo-300 transition-colors w-fit"
        >
          {displayValue} ↗
        </Link>
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-300/70 hover:underline hover:text-indigo-300 transition-colors truncate"
        >
          {displayValue} ↗
        </a>
      ) : (
        <span className="text-sm text-white/70">{displayValue}</span>
      )}
    </>
  );
}

export function InfoPageFields({
  fieldProps,
}: {
  fieldProps: InfoPageFieldProps[];
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 items-baseline">
      {fieldProps.map((props) => (
        <InfoPageField {...props} />
      ))}
    </div>
  );
}
