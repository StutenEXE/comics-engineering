import { CreateContributionBundleForm } from "~/components/forms/contribution/CreateContributionBundleForm";
import { UpdateContributionBundleForm } from "~/components/forms/contribution/UpdateContributionBundleForm";
import type { ContributionBundle } from "~/models/contributionBundle";
import { GenericModal } from "../GenericModal";

interface ContributionBundleModalProps {
  bundle?: ContributionBundle;
  action: "create" | "update";
  isOpen: boolean;
  onSubmit?: (bundle: Partial<ContributionBundle>, hasChanges: boolean) => void;
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
  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        { action === "create" && (
          <CreateContributionBundleForm
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        )}
        { action === "update" && bundle && (
          <UpdateContributionBundleForm 
            bundle={bundle}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        )}
      </div>
    </GenericModal>
  );
}
