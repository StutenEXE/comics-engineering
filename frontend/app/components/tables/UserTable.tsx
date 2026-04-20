import { getUserColumns, type User } from "~/models/user"
import { GenericTable } from "./GenericTable"
import type { Error } from "~/utils/error"
import { MdDelete, MdModeEdit, MdRemoveRedEye } from "react-icons/md"
import { Link } from "react-router"
import { useConfirm } from "../modals/ConfirmModalProvider"


interface UserTableProps {
    userList: User[] | null | undefined
    isLoading?: boolean
    error?: Error
    showActions?: boolean
    className?: string
}


export function UserTable({ userList, isLoading, error, showActions }: UserTableProps) {

    const confirm = useConfirm()

    const actionGenerator = (usr: User) => {
        return (
             <div className="w-min flex gap-2 justify-center items-center">
                <Link to={`/user/${usr?.id}`}>
                    <MdRemoveRedEye size={20} 
                    className="hover:text-green-500"/>
                </Link>
                <MdModeEdit size={20} className="cursor-pointer hover:text-blue-500"/>
                <MdDelete size={20} className="cursor-pointer hover:text-red-500"
                    onClick={() => confirm({
                        title: "Delete User",
                        message: `Are you sure you want to delete user ${usr.username}? This action cannot be undone.`,
                        onConfirm: () => { 
                            console.log(`User ${usr.username} deleted`)
                        }
                    })}
                />
            </div>
        )
    }

    return (
        <GenericTable list={userList} columns={getUserColumns()}  
        addActions={showActions} actionGenerator={actionGenerator}
        isLoading={isLoading} error={error} />
    )
}