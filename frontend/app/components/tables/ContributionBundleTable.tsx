import { useTranslation } from "~/i18n/i18n";
import { getBundleColumns, type ContributionBundle } from "~/models/contributionBundle";
import { GenericTable } from "./GenericTable";
import { type Error } from "~/utils/error"; 
import { useAppSelector } from "~/store/hooks";

interface ContributionBundleTableProps {
    bundleList: ContributionBundle[] | null | undefined;
    addActions: boolean;
    onContributionClick?: (b: ContributionBundle) => void,
    isLoading?: boolean;
    error?: Error;
    className?: string;
}

export function ContributionBundleTable({
    bundleList,
    addActions,
    onContributionClick,
    isLoading,
    error,
}: ContributionBundleTableProps) {
    const { t } = useTranslation();

    return (
        <GenericTable
            list={
                bundleList
                    ? [...bundleList]?.sort(
                        (b1, b2) =>
                            b2.createdAt.getTime() - b1.createdAt.getTime(),
                    )
                    : []
            }
            columns={getBundleColumns(addActions, onContributionClick)}
            isLoading={isLoading}
            emptyMessage={t("cbundle.nonefound")}
            error={error}
        >

        </GenericTable>)
}