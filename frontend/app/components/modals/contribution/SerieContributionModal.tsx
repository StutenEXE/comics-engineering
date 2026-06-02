import { SerieContributionForm } from "~/components/forms/contribution/SerieContributionForm";
import { GenericModal } from "../GenericModal";
import type { SimpleContribution } from "~/models/contribution";
import type { Serie } from "~/models/serie";

interface SerieContributionModalProps {
  serie?: Serie;
  action: "create" | "update";
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function SerieContributionModal({
  serie,
  action,
  isOpen,
  onSubmit,
  onClose,
}: SerieContributionModalProps) {
  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c);
    onClose();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <SerieContributionForm
        serie={serie}
        action={action}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </GenericModal>
  );
}
