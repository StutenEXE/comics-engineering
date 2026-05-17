import { SelectRhfInput } from "~/components/forms/fields/SelectRhfInput";
import type { ColumnDef } from "~/components/tables/GenericTable";
import { useTranslation } from "~/i18n/i18n";
import { parseToSimpleContribution, type SimpleContribution } from "./contribution";
import { parseToSimpleUser, type SimpleUser } from "./user";
import React from "react";

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
    contributions: SimpleContribution[]
    createdAt: Date,
    modifiedAt: Date,
}

export function parseToBundle(data: Record<string, any>): ContributionBundle {
    return {
        id: data.id,
        submitter: data.submitter ? parseToSimpleUser(data.submitter) : undefined,
        status: data.status as ContributionBundleStatusEnum,
        note: data.note,
        contributions: data.contributions?.map((c: Record<string, any>) => parseToSimpleContribution(c)) ?? [],
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
    }
}

export interface SimpleContributionBundle {
    id: number,
    submitterId: number,
    submitterUsername: string,
    status: ContributionBundleStatusEnum,
    note: string,
    createdAt: Date,
    modifiedAt: Date,
}

export function parseToSimpleBundle(data: Record<string, any>): SimpleContributionBundle {
    return {
        id: data.id,
        submitterId: data.submitterId,
        submitterUsername: data.submitterUsername,
        status: data.status as ContributionBundleStatusEnum,
        note: data.note,
        createdAt: new Date(data.createdAt),
        modifiedAt: new Date(data.modifiedAt),
    }
}

export function getBundleColumns(addActions: boolean, onContibutionClick?: (b: ContributionBundle) => void): ColumnDef<ContributionBundle>[] {
    const { t, locale } = useTranslation();

    return [
        {
            key: 'id',
            header: t('cbundle.id'),
            searchable: true,
            cellRenderer: (b) => b.id,
            getValue: (b) => String(b.id)
        },
        {
            key: 'note',
            header: t('cbundle.note'),
            cellRenderer: (b) => b.note,
            getValue: (b) => b.note
        },
        {
            key: 'date',
            header: t('cbundle.date'),
            cellRenderer: (b) => b.createdAt ? b.createdAt.toLocaleDateString(locale) : t('generic.uknown'),
        },
        {
            key: 'status',
            header: t('cbundle.status'),
            searchable: true,
            cellRenderer: (b) => {
                if (!addActions) {
                    return b.status
                }
                // Create select componentval
                const select = React.createElement("select", {
                    className: "bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer appearance-none [&> option]: bg- gray - 900",
                    defaultValue: b.status
                },
                    // Create options for select component
                    ...Object.values(ContributionBundleStatusEnum).map((s) =>
                        React.createElement("option", {
                            key: s, value: s, className: "cursor-pointer"
                        }, t(`cbundle.enum.status.${s}`)
                        )
                    )
                )
                return select
            },
            getValue: (b) => b.status
        },
        {
            key: "contributions",
            header: t('cbundle.contributions'),
            cellRenderer: (b) => {
                if (!addActions) {
                    return b.contributions.length
                }
                return React.createElement('span', {
                    className: 'hover:underline',
                    onClick: () => onContibutionClick?.(b)
                }, `${t('cbundle.action.seeContributions')} (${b.contributions.length})`)
            },
        }
    ]
}