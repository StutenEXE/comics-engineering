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
        <>
            <div className="-mt-2 -mb-2 flex items-center justify-between gap-2">
                <p className="w-full text-lg text-gray-600">
                    <b>{headerTitle}</b>
                </p>
                <LinkButtonList links={links} />
            </div>
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <h3 className="text-xl text-gray-400 italic">{subtitle}</h3> 
            </div>
            <div className="-mt-2 -mb-2 flex justify-end items-center gap-2">
                <p className="text-xs">
                    {t("infoheader.addedBy")} <b>{addedBy}</b> {t("generic.the")} <b>{createdAt?.toLocaleDateString(locale)}</b>
                </p>
                <p className="text-xs">
                    {t("infoheader.modified")} : <b>{modifiedAt?.toLocaleDateString(locale)}</b>
                </p>
            </div>
        </>
    )
}