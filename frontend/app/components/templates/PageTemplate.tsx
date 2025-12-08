import type { ReactNode } from "react"
import { LinkButtonList, type Link } from "../lists/LinkButtonList"

interface PageTemplateProps {
    hasImg?: boolean
    imgUrl?: string
    imgAlt?: string
    links?: Link[]
    children?: ReactNode
}

export function PageTemplate({ hasImg, imgUrl, imgAlt, links, children}: PageTemplateProps) {
    return (
        <main className="flex flex-col items-center pt-8">
            <div className="max-w-500 w-1/2">
                <div className="w-full flex justify-center gap-4 relative pb-4">
                    {hasImg && (
                        <div className="w-2/5 pr-6 border-r">
                            <img src={imgUrl ?? "/placeholder.jpg" } alt={imgAlt ?? "placeholder"} />
                        </div>
                    )}
                    <div className={"w-3/5 pl-6 flex flex-col gap-4"}>
                        {children}
                        <LinkButtonList links={links} />
                    </div>
                </div>
                
            </div>
        </main>
    )
}