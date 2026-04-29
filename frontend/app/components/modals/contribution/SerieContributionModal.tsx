import { SerieContributionForm } from "~/components/forms/SerieContributionForm";
import { GenericModal } from "../GenericModal";

interface SerieContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function SerieContributionModal({
  isOpen,
  onClose,
}: SerieContributionModalProps) {
  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <SerieContributionForm />
      </div>
    </GenericModal>
  );
}
