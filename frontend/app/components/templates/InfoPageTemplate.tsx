import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "~/i18n/i18n";

interface PageTemplateProps {
  hasImg?: boolean;
  imgUrl?: string;
  imgAlt?: string;
  children?: ReactNode;
}

export function InfoPageTemplate({
  hasImg,
  imgUrl,
  imgAlt,
  children,
}: PageTemplateProps) {
  return (
    <main className="flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="flex gap-8 items-start">
          {hasImg && (
            <div className="w-48 shrink-0 sticky top-24">
              <img
                src={imgUrl ?? "/placeholder.jpg"}
                alt={imgAlt ?? "placeholder"}
                className="w-full rounded-lg border border-white/8 shadow-xl shadow-black/40 object-cover"
              />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-6 min-w-0">{children}</div>
        </div>
      </div>
    </main>
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
  value?: ReactNode;
  to?: string; // internal link
  href?: string; // external link
  hide?: boolean; // skip if no value
}

export function InfoPageField({
  label,
  value,
  to,
  href,
  hide,
}: InfoPageFieldProps) {
  const { t } = useTranslation();

  if (hide) return <></>

  const displayValue = value ?? t("generic.uknown")
  
  return (
    <>
      <span className="text-xs font-medium uppercase tracking-widest text-white/30 whitespace-nowrap">
        {label}
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
