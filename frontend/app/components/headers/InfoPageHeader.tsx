import { useTranslation } from "~/i18n/i18n";
import { LinkButton, type LinkButtonProps } from "../buttons/LinkButton";
import { LinkButtonList, type Link } from "../lists/LinkButtonList";

interface PageHeaderComponentProps {
    headerTitle?: string,
    title?: string,
    subtitle?: string,
    createdAt?: Date,
    modifiedAt?: Date,
    addedBy?: string,
    links?: Link[]
}
 
export function InfoPageHeaderComponent({ headerTitle, title, subtitle, createdAt, modifiedAt, addedBy, links }: PageHeaderComponentProps) {
  const { t, locale } = useTranslation();

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-white/10">

      {/* Top row — category label + actions */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-white/40">
          {headerTitle}
        </span>
        <LinkButtonList links={links} />
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white/90">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/40 italic">{subtitle}</p>
        )}
      </div>

      {/* Bottom row — metadata */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-white/25">
          {t("infoheader.addedBy")}{" "}
          <span className="text-white/50">{addedBy}</span>
          {" "}{t("generic.the")}{" "}
          <span className="text-white/50">{createdAt?.toLocaleDateString(locale)}</span>
        </p>
        <span className="text-white/10">·</span>
        <p className="text-xs text-white/25">
          {t("infoheader.modified")}{" "}
          <span className="text-white/50">{modifiedAt?.toLocaleDateString(locale)}</span>
        </p>
      </div>

    </div>
  );
}