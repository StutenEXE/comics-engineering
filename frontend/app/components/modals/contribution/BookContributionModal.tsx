import { BookContributionForm } from "~/components/forms/contribution/BookContributionForm";
import type { Book } from "~/models/book";
import type { SimpleContribution } from "~/models/contribution";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import { GenericModal } from "../GenericModal";
import type { SimpleIssue } from "~/models/issue";

interface BookContributionModalProps {
  book?: Book;
  serieLocalRef?: { id: number; name: string };
  action: "create" | "update";
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
  // Local issues available in the current bundle for linking
  localIssues?: SimpleIssue[];
  localIssueSeries?: SimpleIssueSerie[];
}

// User will be able to create items that depend on other items
export function BookContributionModal({
  book,
  serieLocalRef,
  action,
  isOpen,
  onSubmit,
  onClose,
  localIssues,
  localIssueSeries,
}: BookContributionModalProps) {
  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c);
    onClose();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <BookContributionForm
        book={book}
        serieLocalRef={serieLocalRef}
        localIssues={localIssues}
        localIssueSeries={localIssueSeries}
        action={action}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </GenericModal>
  );
}
