import { useTranslation } from "~/i18n/i18n";
import { parseToSimpleBundle, type SimpleContributionBundle } from "./contributionBundle";
import type { ColumnDef } from "~/components/tables/GenericTable";
import type { Book } from "./book";
import type { Edition } from "./edition";
import type { Serie } from "./serie";
import { buildIssueShortName, type Issue } from "./issue";
import type { IssueSerie } from "./issue-serie";
import type { Publisher } from "./publisher";
import type { Locale } from "~/store/slices/localeSlice";

export enum ContributionTypeEnum {
    BOOK = "book",
    SERIE = "serie",
    EDITION = "edition",
    ISSUE = "issue",
    ISSUE_SERIE = "issueserie",
    PUBLISHER = "publisher",
}

export enum ContributionActionEnum {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete"
}

export enum ContributionStatusEnum {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SKIPPED = "skipped",
    NEEDS_REVISION = "needs_revision"
}

export interface Contribution {
    id: number,
    bundle: SimpleContributionBundle,
    localRef?: number,
    entityType: ContributionTypeEnum,
    action: ContributionActionEnum,
    entityId?: number,
    proposedData: Record<string, any>,
    entitySnapshot?: Record<string, any>,
    status: ContributionStatusEnum,
    resolvedEntityId?: number,
}

export function parseToContribution(data: Record<string, any>): Contribution {
    return {
        id: data.id,
        bundle: parseToSimpleBundle(data.bundle),
        localRef: data.localRef,
        entityType: data.entityType as ContributionTypeEnum,
        action: data.action as ContributionActionEnum,
        entityId: data.entityId,
        proposedData: data.proposedData,
        entitySnapshot: data.entitySnapshot,
        status: data.status as ContributionStatusEnum,
        resolvedEntityId: data.resolvedEntityId,
    }
}

export interface SimpleContribution {
    id: number,
    bundleId?: number,
    localRef?: number,
    entityType: ContributionTypeEnum,
    action: ContributionActionEnum,
    entityId?: number,
    proposedData: Record<string, any>,
    entitySnapshot?: Record<string, any>,
    status?: ContributionStatusEnum,
    resolvedEntityId?: number,
}

export interface ContributionTree extends SimpleContribution {
  children: ContributionTree[];
}



export function parseToSimpleContribution(data: Record<string, any>): SimpleContribution {
    return {
        id: data.id,
        bundleId: data.bundleId,
        localRef: data.localRef,
        entityType: data.entityType as ContributionTypeEnum,
        action: data.action as ContributionActionEnum,
        entityId: data.entityId,
        proposedData: data.proposedData,
        entitySnapshot: data.entitySnapshot,
        status: data.status as ContributionStatusEnum,
        resolvedEntityId: data.resolvedEntityId,
    }
}

export function isSimpleContribution(c: Contribution | SimpleContribution): c is SimpleContribution {
    return (c as SimpleContribution).bundleId !== undefined;
}

export function contributionToSimpleContribution(c: Contribution): SimpleContribution {
    return {
        id: c.id,
        bundleId: c.bundle?.id,
        localRef: c.localRef,
        entityType: c.entityType as ContributionTypeEnum,
        action: c.action as ContributionActionEnum,
        entityId: c.entityId,
        proposedData: c.proposedData,
        entitySnapshot: c.entitySnapshot,
        status: c.status as ContributionStatusEnum,
        resolvedEntityId: c.resolvedEntityId,
    }
}

export function getContributionName(c: SimpleContribution | Contribution, locale: Locale): string {
    switch (c.entityType) {
        case ContributionTypeEnum.BOOK: return (c.proposedData as Book).name
        case ContributionTypeEnum.EDITION:
            const ed = (c.proposedData as Edition)
            return `${ `${ed.book?.name} - ` || ""}${ed.publisher?.name} (${ed.parutionDate.toLocaleDateString(locale)})`
        case ContributionTypeEnum.SERIE: return (c.proposedData as Serie).name
        case ContributionTypeEnum.ISSUE: return buildIssueShortName(c.proposedData as Issue)
        case ContributionTypeEnum.ISSUE_SERIE: return (c.proposedData as IssueSerie).name
        case ContributionTypeEnum.PUBLISHER: return (c.proposedData as Publisher).name
    }
}

export function getContributionColumns(): ColumnDef<Contribution>[] {
    const { t, locale } = useTranslation()
    return [
        {
            key: 'id',
            header: t('contribution.id'),
            searchable: true,
            cellRenderer: (c) => c.id,
            getValue: (c) => String(c.id)
        },
        {
            key: 'action',
            header: t('contribution.action'),
            searchable: true,
            cellRenderer: (c) => t(c.action, { capitalize: true }),
            getValue: (c) => c.action
        },
        {
            key: 'type',
            header: t('contribution.type'),
            searchable: true,
            cellRenderer: (c) => t(c.entityType, { capitalize: true }),
            getValue: (c) => c.entityType
        },
        {
            key: 'item',
            header: t('contribution.item'),
            searchable: true,
            cellRenderer: (c) => getContributionName(c, locale),
            getValue: (c) => c.entityType
        },
        {
            key: 'date',
            header: t('contribution.date'),
            cellRenderer: (c) => c.bundle.createdAt ? c.bundle.createdAt.toLocaleDateString(locale) : t('generic.uknown'),
        },
        {
            key: 'status',
            header: t('contribution.status'),
            searchable: true,
            cellRenderer: (c) => c.status,
            getValue: (c) => c.status
        }
    ]
}