import { SerieContributionForm } from "~/components/forms/SerieContributionForm";
import { GenericModal } from "../GenericModal";
import type { SimpleContribution } from "~/models/contribution";
import type { Book } from "~/models/book";
import { BookContributionForm } from "~/components/forms/BookContributionForm";

interface BookContributionModalProps {
  book?: Book;
  serieLocalRef?: number
  action: "create" | "update";
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function BookContributionModal({
  book,
  serieLocalRef,
  action,
  isOpen,
  onSubmit,
  onClose,
}: BookContributionModalProps) {
  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c);
    onClose();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <BookContributionForm
          book={book}
          serieLocalRef={serieLocalRef}
          action={action}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </GenericModal>
  );
}
