import { useTranslation } from "~/i18n/i18n";
import {
  ContributionBundleStatusEnum,
  type ContributionBundle,
} from "~/models/contributionBundle";
import { ContributionBundleForm } from "./ContributionBundleForm";
import {
  useCreateContributionMutation,
  useUpdateContributionMutation,
} from "~/store/services/api";
import {
  contributionToSimpleContribution,
  type Contribution,
  type SimpleContribution,
} from "~/models/contribution";
import { useToast } from "~/components/toast/Toast";

interface UpdateContributionBundleFormProps {
  bundle: ContributionBundle;
  onSubmit?: (bundle: Partial<ContributionBundle>) => void;
  onCancel?: () => void;
}

export function UpdateContributionBundleForm({
  bundle,
  onSubmit,
  onCancel,
}: UpdateContributionBundleFormProps) {
  const { t } = useTranslation();
  const toast = useToast();

  const [createContribution] = useCreateContributionMutation();
  const [updateContribution] = useUpdateContributionMutation();

  const triggerCreation = (contribution: Partial<SimpleContribution>) => {
    return createContribution(contribution).then((result) => {
      if ("error" in result) {
        toast.error(t("contribution.create.error"));
        return false;
      }
      toast.success(t("contribution.create.success"));
      return contributionToSimpleContribution(result.data.contribution); // Return the created contribution
    });
  };

  const triggerUpdate = (contribution: Partial<SimpleContribution>) => {
    return updateContribution(contribution).then((result) => {
      if ("error" in result) {
        toast.error(t("contribution.update.error"));
        return false;
      }
      toast.success(t("contribution.update.success"));
      return true;
    });
  };

  return (
    <ContributionBundleForm
      action="update"
      bundle={bundle}
      disableNewContributions={
        bundle.status === ContributionBundleStatusEnum.APPROVED ||
        bundle.status === ContributionBundleStatusEnum.REJECTED
      }
      onSubmit={onSubmit}
      onCancel={onCancel}
      onContributionAdd={(c) => triggerCreation(c)}
      onContributionEdit={(c) => triggerUpdate(c)}
    />
  );
}
