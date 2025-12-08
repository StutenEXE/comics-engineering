
interface PageHeaderComponentProps {
    headerTitle?: string,
    title?: string,
    subtitle?: string,
    createdAt?: Date,
    modifiedAt?: Date,
    addedBy?: string,
}
 
export function PageHeaderComponent({ headerTitle, title, subtitle, createdAt, modifiedAt, addedBy }: PageHeaderComponentProps) {
    return (
        <>
            <div className="-mt-2 -mb-2 flex items-center gap-2">
                <p className="text-lg text-gray-700">
                    <b>{headerTitle}</b>
                </p>
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