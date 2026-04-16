import { parseDataToIssue, type Issue } from "./issue"
import { parseDataToUser, type User } from "./user"

export interface IssueSerie {
    id: number,
    name: string,
    desc: string,
    startDate: Date,
    endDate: Date | null,
    issues: Issue[]
    createdAt: Date,
    modifiedAt: Date,
    addedBy: User | null
}

// Utility function to transform the api data to an instance of Issue
export function parseDataToIssueSerie(data: Record<string, any>): IssueSerie {
    return {
        id: data.id,
        name: data.name,
        desc: data.desc,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null, 
        issues: data.issues?.map((i: Record<string, any>) =>  parseDataToIssue(i)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
        addedBy: data.addedBy ? parseDataToUser(data.addedBy) : null  
    }
}