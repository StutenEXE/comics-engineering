import type { SimpleContribution } from "~/models/contribution";
import { GenericModal } from "../GenericModal";
import type { Issue } from "~/models/issue";
import { IssueContributionForm } from "~/components/forms/contribution/IssueContributionForm";

interface IssueContributionModalProps {
  issue?: Issue;
  issueSerieLocalRef?: { id: number; name: string };
  action: "create" | "update";
  isOpen: boolean;
  onSubmit: (c: Partial<SimpleContribution>) => void;
  onClose: () => void;
}

// User will be able to create items that depend on other items
export function IssueContributionModal({
  issue,
  issueSerieLocalRef,
  action,
  isOpen,
  onSubmit,
  onClose,
}: IssueContributionModalProps) {
  const handleSubmit = (c: Partial<SimpleContribution>) => {
    onSubmit(c);
    onClose();
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose}>
      <div className="border border-gray-300 rounded-lg shadow-md bg-black">
        <IssueContributionForm
          issue={issue}
          issueSerieLocalRef={issueSerieLocalRef}
          action={action}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </GenericModal>
  );
}
