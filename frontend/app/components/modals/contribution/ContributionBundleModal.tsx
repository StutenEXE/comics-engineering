import { ContributionBundleForm } from "~/components/forms/contribution/ContributionBundleForm";
import { GenericModal } from "../GenericModal";
import type { ContributionBundle } from "~/models/contributionBundle";
import { CreateContributionBundleForm } from "~/components/forms/contribution/CreateContributionBundleForm";
import { ModeNight } from "@mui/icons-material";
import { UpdateContributionBundleForm } from "~/components/forms/contribution/UpdateContributionBundleForm";

interface ContributionBundleModalProps {
  bundle?: ContributionBundle;
  action: "create" | "update";
  isOpen: boolean;
  onSubmit?: (bundle: Partial<ContributionBundle>) => void;
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
