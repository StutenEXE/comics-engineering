import { type ContributionBundle } from "~/models/contributionBundle";
import { ContributionBundleForm } from "./ContributionBundleForm";
import { useConfirm } from "~/components/modals/ConfirmModalProvider";
import { useTranslation } from "~/i18n/i18n";

interface CreateContributionBundleFormProps {
  onSubmit?: (bundle: Partial<ContributionBundle>, hasChanges: boolean) => void;
  onCancel?: () => void;
}

export function CreateContributionBundleForm({
  onSubmit,
  onCancel,
}: CreateContributionBundleFormProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const handleCancel = () => {
    confirm({
      title: t("cbundle.form.cancel.title"),
      message: t("cbundle.form.cancel.message"),
      onConfirm: () => {
        onCancel?.();
      },
    });
  };
  return (
    <ContributionBundleForm
      action="create"
      onSubmit={onSubmit}
      onCancel={handleCancel}
    />
  );
}

