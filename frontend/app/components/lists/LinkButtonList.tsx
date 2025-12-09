import { LinkButton, type LinkButtonProps } from "../buttons/LinkButton"

export interface Link extends LinkButtonProps {
    name: string
}

interface LinkButtonListProps {
    links?: Link[]
}

export function LinkButtonList({ links }: LinkButtonListProps) {

    const list = !links ? [] : [...links]

    return (
        <div className="flex w-full justify-end gap-2">
            {
                list.map((link) => <LinkButton key={link.name} {...link}>{link.name}</LinkButton>)
            }
        </div>
    )
}