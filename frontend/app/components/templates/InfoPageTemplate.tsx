import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";
import type { Error } from "~/utils/error";
import { HelpBadgeTooltip } from "../badges/HelpBadge";
import { GenericPageTemplate } from "./GenericPageTemplate";
import { EnlargeableImage } from "../misc/EnlargeableImage";
import { SkeletonImage, SkeletonText, SkeletonField } from "../misc/Skeleton";

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
            {isLoading ? (
              <SkeletonImage className="w-full aspect-[2/3] rounded-lg shadow-xl shadow-black/40" />
            ) : (
              <EnlargeableImage
                src={imgUrl ?? "/placeholder.jpg"}
                alt={imgUrl ?? "/placeholder.jpg"}
                className="w-full rounded-lg border border-white/8 shadow-xl shadow-black/40 object-cover"
              />
            )}
          </div>
        )}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
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
          {!error && children}
        </div>
      </div>
    </GenericPageTemplate>
  );
}

interface InfoPageSectionProps {
  label: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function InfoPageSection({
  label,
  isLoading,
  children,
}: InfoPageSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </span>
      {isLoading && <SkeletonText lines={2} />}
      {!isLoading && children}
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
  isLoading?: boolean;
}

export function InfoPageField({
  label,
  labelTooltip,
  value,
  to,
  href,
  hide,
  isLoading,
}: InfoPageFieldProps) {
  const { t } = useTranslation();

  if (hide) return <></>;

  const displayValue = value ?? t("generic.unknown");

  if (isLoading) {
    return <SkeletonField label={label} labelTooltip={labelTooltip} />;
  }

  return (
    <>
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/30 whitespace-nowrap">
        {label}
        {labelTooltip && <HelpBadgeTooltip tooltipContent={labelTooltip} />}
      </span>
      {/* Internal link found */}
      {to ? (
        <Link
          to={to}
          className="text-sm text-indigo-300/70 hover:underline hover:text-indigo-300 transition-colors w-fit"
        >
          {displayValue} ↗
        </Link>
      // External link found
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-300/70 hover:underline hover:text-indigo-300 transition-colors truncate"
        >
          {displayValue} ↗
        </a>
      // No link
      ) : (
        <span className="text-sm text-white/70">{displayValue}</span>
      )}
    </>
  );
}

export function InfoPageFields({
  fieldProps,
  isLoading,
}: {
  fieldProps: InfoPageFieldProps[];
  isLoading?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 items-baseline">
      {fieldProps.map((props) => (
        <InfoPageField key={props.label} {...props} isLoading={isLoading} />
      ))}
    </div>
  );
}
