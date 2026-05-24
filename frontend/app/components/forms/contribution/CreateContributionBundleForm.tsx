import { type ContributionBundle } from "~/models/contributionBundle";
import { ContributionBundleForm } from "./ContributionBundleForm";

interface CreateContributionBundleFormProps {
  onSubmit?: (bundle: Partial<ContributionBundle>) => void;
  onCancel?: () => void;
}

export function CreateContributionBundleForm({
  onSubmit,
  onCancel,
}: CreateContributionBundleFormProps) {
  return (
    <ContributionBundleForm
      action="create"
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
