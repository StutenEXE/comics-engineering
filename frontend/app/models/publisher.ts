import type { Edition } from "./edition"

export interface Publisher {
    id: number,
    name: string,
    editions: Partial<Edition>[],
    createdAt: Date,
    modifiedAt: Date
}