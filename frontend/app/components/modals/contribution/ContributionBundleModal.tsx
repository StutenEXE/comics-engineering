import { ContributionBundleForm } from "~/components/forms/ContributionBundleForm";
import { GenericModal } from "../GenericModal";
import type { ContributionBundle } from "~/models/contributionBundle";

interface ContributionBundleModalProps {
  isOpen: boolean;
  onSubmit?: (bundle: Partial<ContributionBundle>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function ContributionBundleModal({
  isOpen,
  onSubmit,
  onClose,
}: ContributionBundleModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <ContributionBundleForm onSubmit={onSubmit} onCancel={onClose}></ContributionBundleForm>
      </div>
    </GenericModal>
  );
}
