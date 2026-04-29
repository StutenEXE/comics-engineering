import { SerieContributionForm } from "~/components/forms/SerieContributionForm";
import { GenericModal } from "../GenericModal";
import type { SimpleContribution } from "~/models/contribution";

interface SerieContributionModalProps {
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function SerieContributionModal({
  isOpen,
  onSubmit,
  onClose,
}: SerieContributionModalProps) {

  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c)
    onClose()
  }

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <SerieContributionForm onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </GenericModal>
  );
}
