import { parseDataToIssue, type Issue } from "./issue"
import { parseDataToUser, type User } from "./user"

export interface IssueSerie {
    id: number,
    name: string,
    desc: string,
    voStart: Date,
    voEnd: Date | null,
    issues: Partial<Issue>[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User
}

// Utility function to transform the api data to an instance of Issue
export function parseDataToIssueSerie(data: Record<string, any>): IssueSerie {
    return {
        id: data.id,
        name: data.name,
        desc: data.desc,
        voStart: new Date(data.voStart),
        voEnd: data.voEnd ? new Date(data.voEnd) : null, 
        issues: data.issues?.map((i: Record<string, any>) => parseDataToIssue(i)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: parseDataToUser(data.addedBy)
    }
}