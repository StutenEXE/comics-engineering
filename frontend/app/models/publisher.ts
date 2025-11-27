import type { Edition } from "./edition"

export type Publisher = {
    id: number,
    name: string,
    editions: Partial<Edition>[],
    createdAt: Date,
    modifiedAt: Date
}