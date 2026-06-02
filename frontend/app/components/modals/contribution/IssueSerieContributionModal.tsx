import { SerieContributionForm } from "~/components/forms/contribution/SerieContributionForm";
import type { SimpleContribution } from "~/models/contribution";
import type { IssueSerie } from "~/models/issue-serie";
import { GenericModal } from "../GenericModal";
import { IssueSerieContributionForm } from "~/components/forms/contribution/IssueSerieContributionForm";

interface IssueSerieContributionModalProps {
  issueSerie?: IssueSerie;
  action: "create" | "update";
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function IssueSerieContributionModal({
  issueSerie,
  action,
  isOpen,
  onSubmit,
  onClose,
}: IssueSerieContributionModalProps) {
  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c);
    onClose();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <IssueSerieContributionForm
        issueSerie={issueSerie}
        action={action}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </GenericModal>
  );
}
