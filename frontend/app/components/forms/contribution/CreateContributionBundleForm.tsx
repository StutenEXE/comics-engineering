import { type ContributionBundle } from "~/models/contributionBundle";
import { ContributionBundleForm } from "./ContributionBundleForm";
import { useConfirm } from "~/components/modals/ConfirmModalProvider";
import { useTranslation } from "~/i18n/i18n";

interface CreateContributionBundleFormProps {
  onSubmit?: (
    bundle: Partial<ContributionBundle>,
    hasChanges: boolean,
  ) => Promise<void>;
  onCancel?: () => void;
}

export function CreateContributionBundleForm({
  onSubmit,
  onCancel,
}: CreateContributionBundleFormProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  // Only ask when something would be lost
  const handleCancel = (hasChanges: boolean) => {
    if (!hasChanges) {
      onCancel?.();
      return;
    }
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
