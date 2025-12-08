import type { JSX } from "react";


interface GenericListProps<T> {
    list: T[] | null | undefined
    emptyMsg: string
    elemGenerator: (l: T) => JSX.Element
    vertical?: boolean
    className?: string
}

export function GenericList<T>({ list, emptyMsg, elemGenerator, vertical, className }: GenericListProps<T>) {
    const divClassName = vertical ? 
        `max-h-40 flex flex-col gap-0 p-2 overflow-y-scroll snap-y snap-proximity ${className}`:
        `flex gap-2 p-2 overflow-hidden snap-x snap-proximity ${className}`

    return(
        <div className={divClassName}>
            { (!list || list.length == 0) && (
                <p>{emptyMsg}</p>
            )}
            { list && list.map(elemGenerator)}
        </div>
    )
}