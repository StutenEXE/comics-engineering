import { ContributionBundleForm } from "~/components/forms/ContributionBundleForm";
import { GenericModal } from "../GenericModal";

interface ContributionBundleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function ContributionBundleModal({
  isOpen,
  onClose,
}: ContributionBundleModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <ContributionBundleForm onCancel={onClose}></ContributionBundleForm>
      </div>
    </GenericModal>
  );
}
