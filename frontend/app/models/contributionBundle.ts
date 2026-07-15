import { resolveTimeViewsResponse } from "@mui/x-date-pickers/internals";
import { parseToSimpleContribution, type SimpleContribution } from "./contribution";
import { parseToSimpleUser, type SimpleUser } from "./user";

export enum ContributionBundleStatusEnum {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    NEEDS_REVISION = "needs_revision",
}

export interface ContributionBundle {
    id: number,
    submitter?: SimpleUser,
    status: ContributionBundleStatusEnum,
    note: string,
    nContributions: number,
    contributions: SimpleContribution[]
    createdAt: Date,
    modifiedAt: Date,
}

export interface SimpleContributionBundle {
    id: number,
    submitterId: number,
    submitterUsername: string,
    status: ContributionBundleStatusEnum,
    note: string,
    nContributions: number,
    createdAt: Date,
    modifiedAt: Date,
}


export function parseToBundle(data: Record<string, any>): ContributionBundle {
    return {
        id: data.id,
        submitter: data.submitter ? parseToSimpleUser(data.submitter) : undefined,
        status: data.status as ContributionBundleStatusEnum,
        note: data.note,
        nContributions: data.nContributions,
        contributions: data.contributions?.map((c: Record<string, any>) => parseToSimpleContribution(c)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
    }
}

export function parseToSimpleBundle(data: Record<string, any>): SimpleContributionBundle {
    return {
        id: data.id,
        submitterId: data.submitterId,
        submitterUsername: data.submitterUsername,
        status: data.status as ContributionBundleStatusEnum,
        note: data.note,
        nContributions: data.nContributions,
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
    }
}

export function newBundle(submitter: SimpleUser): Partial<ContributionBundle> {
    const b: Partial<ContributionBundle> = {
        submitter: submitter,
        status: ContributionBundleStatusEnum.PENDING,
        contributions: []
    }
    return b;
}

export function isSimpleBundle(bundle?: ContributionBundle | SimpleContributionBundle): bundle is SimpleContributionBundle {
    if (!bundle) return false;
    return (bundle as SimpleContributionBundle).submitterId !== undefined && (bundle as SimpleContributionBundle).submitterUsername !== undefined
}