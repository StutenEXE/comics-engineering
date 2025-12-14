import { createBackupFromIssue, type Issue } from "~/models/issue";
import type { User } from "~/models/user";
import { compareDates } from "~/utils/date";
import type { Error } from "~/utils/error";
import { UserCard } from "../cards/UserCard";
import { GenericList } from "./GenericList";


interface UserListProps {
    userList: User[] | null | undefined
    isLoading?: boolean
    error?: Error
    showActions?: boolean
    className?: string
}

export function UserList({ userList, isLoading, error, showActions, className }: UserListProps) {
    const mapper = (usr: User) => (
        <UserCard className="w-25 snap-center hover:bg-gray-700 pb-1 rounded-sm" 
                key={usr?.id} user={usr} showActions={showActions}/>
    ) 

    return(
        <>
            <GenericList 
                list={userList} 
                emptyMsg={isLoading ? "Loading user..." : 
                    error ? error.error :  
                    "No users found"}
                elemGenerator={mapper}
                vertical
                className={className}
            />
        </>
    )
}