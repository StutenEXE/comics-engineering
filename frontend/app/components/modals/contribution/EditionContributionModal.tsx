import { EditionContributionForm } from "~/components/forms/contribution/EditionContributionForm";
import type { SimpleContribution } from "~/models/contribution";
import type { Edition } from "~/models/edition";
import { GenericModal } from "../GenericModal";

interface EditionContributionModalProps {
  edition?: Edition;
  bookLocalRef?: { id: number; name: string };
  action: "create" | "update";
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function EditionContributionModal({
  edition,
  bookLocalRef,
  action,
  isOpen,
  onSubmit,
  onClose,
}: EditionContributionModalProps) {
  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c);
    onClose();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <EditionContributionForm
        edition={edition}
        bookLocalRef={bookLocalRef}
        action={action}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </GenericModal>
  );
}
