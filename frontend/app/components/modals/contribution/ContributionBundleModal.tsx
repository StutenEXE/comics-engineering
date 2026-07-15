import { CreateContributionBundleForm } from "~/components/forms/contribution/CreateContributionBundleForm";
import { UpdateContributionBundleForm } from "~/components/forms/contribution/UpdateContributionBundleForm";
import {
  isSimpleBundle,
  type ContributionBundle,
  type SimpleContributionBundle,
} from "~/models/contributionBundle";
import { GenericModal } from "../GenericModal";
import { useEffect } from "react";
import { useLazyBundleByIdQuery } from "~/store/services/api";

interface ContributionBundleModalProps {
  bundle?: ContributionBundle | SimpleContributionBundle;
  action: "create" | "update";
  isOpen: boolean;
  onSubmit?: (
    bundle: Partial<ContributionBundle>,
    hasChanges: boolean,
  ) => Promise<void>;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function ContributionBundleModal({
  bundle,
  action,
  isOpen,
  onSubmit,
  onClose,
}: ContributionBundleModalProps) {
  const [getBundleById, { data }] = useLazyBundleByIdQuery();

  useEffect(() => {
    if (isSimpleBundle(bundle)) {
      getBundleById({ id: bundle.id });
    }
  }, [bundle, getBundleById]);

  const fullBundle: ContributionBundle | undefined = isSimpleBundle(bundle)
    ? data?.bundle
    : bundle;

  return (
    <GenericModal
      shouldCloseOnOOBClick={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      {action === "create" && (
        <CreateContributionBundleForm onSubmit={onSubmit} onCancel={onClose} />
      )}
      {action === "update" && bundle && (
        <UpdateContributionBundleForm
          bundle={fullBundle}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      )}
    </GenericModal>
  );
}
