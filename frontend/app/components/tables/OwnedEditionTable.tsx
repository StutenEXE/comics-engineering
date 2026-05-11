import { MdDelete, MdModeEdit } from "react-icons/md"
import { useTranslation } from "~/i18n/i18n"
import { getOwnedEditionColumns, type OwnedEdition } from "~/models/ownedEdition"
import type { Error } from "~/utils/error"
import { GenericTable } from "./GenericTable"


interface OwnedEditionTableProps {
    editionList: OwnedEdition[] | null | undefined
    isLoading?: boolean
    error?: Error
    className?: string
}


export function OwnedEditionTable({ editionList, isLoading, error }: OwnedEditionTableProps) {
    const { t } = useTranslation()

    const actionGenerator = (ed: OwnedEdition) => {
        return (
             <div className="w-min flex gap-2 justify-center items-center">
                <MdModeEdit size={20} className="cursor-pointer hover:text-blue-500"/>
                <MdDelete size={20} className="cursor-pointer hover:text-red-500"/>
            </div>
        )
    }

    return (
        <GenericTable list={editionList} columns={getOwnedEditionColumns()}  
        addActions={true} actionGenerator={actionGenerator}
        isLoading={isLoading} error={error} />
    )
}