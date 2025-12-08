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
 
export function PageHeaderComponent({ headerTitle, title, subtitle, createdAt, modifiedAt, addedBy, links }: PageHeaderComponentProps) {
    
    return (
        <>
            <div className="-mt-2 -mb-2 flex items-center justify-between gap-2">
                <p className="text-lg text-gray-600">
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
                    Added by <b>{addedBy}</b> the <b>{createdAt?.toLocaleDateString("fr")}</b>
                </p>
                <p className="text-xs">
                    Last modification : <b>{modifiedAt?.toLocaleDateString("fr")}</b>
                </p>
            </div>
        </>
    )
}