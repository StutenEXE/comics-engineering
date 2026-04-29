import { useTranslation } from "~/i18n/i18n"
import type { ContributionBundle } from "~/models/contributionBundle";

interface ContributionBundleFormProps {
    bundle?: ContributionBundle
}

export function ContributionBundleForm({ bundle }: ContributionBundleFormProps) {
    const { t } = useTranslation();
    // TODO
    const handleSubmit = () => { }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-100 mx-auto mt-4 p-2"
        >
            <h2 className="text-xl font-bold mb-4 text-center">{t("cbundle.create")}</h2>
        </form>
    )
}