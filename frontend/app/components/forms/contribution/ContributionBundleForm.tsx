import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import { parseToBook } from "~/models/book";
import {
  ContributionTypeEnum,
  type ContributionTree,
  type SimpleContribution,
} from "~/models/contribution";
import { type ContributionBundle } from "~/models/contributionBundle";
import { parseToEdition } from "~/models/edition";
import { parseToIssue } from "~/models/issue";
import { parseToIssueSerie } from "~/models/issue-serie";
import { parseToSerie } from "~/models/serie";
import { useAppSelector } from "~/store/hooks";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../../buttons/GenericButton";
import { IndentedContributionList } from "../../lists/contributionlists/IndentedContributionList";
import { useConfirm } from "../../modals/ConfirmModalProvider";
import { BookContributionModal } from "../../modals/contribution/BookContributionModal";
import { EditionContributionModal } from "../../modals/contribution/EditionContributionModal";
import { IssueContributionModal } from "../../modals/contribution/IssueContributionModal";
import { IssueSerieContributionModal } from "../../modals/contribution/IssueSerieContributionModal";
import { SerieContributionModal } from "../../modals/contribution/SerieContributionModal";
import { TextAreaRhfInput } from "../fields/TextAreaRhfInput";
import { GenericForm } from "../GenericForm";

interface ContributionBundleFormProps {
  bundle?: ContributionBundle;
  onSubmit?: (bundle: Partial<ContributionBundle>) => void;
  onCancel?: () => void;
}

export function ContributionBundleForm({
  bundle,
  onSubmit,
  onCancel,
}: ContributionBundleFormProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { user } = useAppSelector((state) => state.user);

  // Validation schema
  const schema = z.object({
    note: z.string(),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      note: bundle?.note,
    },
  });

  // Modal states
  const [isEditionOpen, setIsEditionOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isSerieOpen, setIsSerieOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isIssueSerieOpen, setIsIssueSerieOpen] = useState(false);

  // Bundle data
  const [contributions, setContributions] = useState(
    [] as SimpleContribution[],
  );

  // Contribution data
  const [contribToModify, setContribToModify] = useState<
    SimpleContribution | undefined
  >(undefined);
  const [localRef, setLocalRef] = useState<
    { id: number; name: string } | undefined
  >(undefined);

  const openModal = (type: ContributionTypeEnum) => {
    setIsEditionOpen(false);
    setIsBookOpen(false);
    setIsSerieOpen(false);
    setIsIssueOpen(false);
    setIsIssueSerieOpen(false);
    switch (type) {
      case ContributionTypeEnum.EDITION:
        return setIsEditionOpen(true);
      case ContributionTypeEnum.BOOK:
        return setIsBookOpen(true);
      case ContributionTypeEnum.SERIE:
        return setIsSerieOpen(true);
      case ContributionTypeEnum.ISSUE:
        return setIsIssueOpen(true);
      case ContributionTypeEnum.ISSUE_SERIE:
        return setIsIssueSerieOpen(true);
    }
  };

  const addContribution = (c: Partial<SimpleContribution>) => {
    const localRef = -(contributions.length + 1);
    c.id = -localRef; // Used to identify locally
    c.localRef = localRef;
    contributions.push(c as SimpleContribution);
  };

  const createDependantContribution = (c: SimpleContribution) => {
    setContribToModify(undefined);
    setLocalRef({
      id: c.localRef!,
      name: c.proposedData.name,
    });
    switch (c.entityType) {
      case ContributionTypeEnum.BOOK:
        return setIsEditionOpen(true);
      case ContributionTypeEnum.SERIE:
        return setIsBookOpen(true);
      case ContributionTypeEnum.ISSUE_SERIE:
        return setIsIssueOpen(true);
    }
    setLocalRef(undefined);
  };

  const editContribution = (c: SimpleContribution) => {
    setContribToModify(c);
    setLocalRef(undefined);
    openModal(c.entityType);
  };

  const removeContribution = (c: ContributionTree) => {
    confirm({
      title: t("cbundle.form.remove.title"),
      message: t("cbundle.form.remove.message"),
      onConfirm: () => {
        // Remove all dependencies
        c.children.forEach((c2) => {
          const idx = contributions.findIndex((nc) => nc.id === c2.id);
          if (idx < 0) return;
          contributions.splice(idx, 1);
        });
        // Remove contribution
        const idx = contributions.findIndex((nc) => nc.id === c.id);
        if (idx < 0) return;
        contributions.splice(idx, 1);
      },
    });
  };

  const handleContributionSubmission = (c: Partial<SimpleContribution>) => {
    if (!contribToModify) {
      addContribution(c);
      return;
    }
    c.id = contribToModify.id;
    c.localRef = contribToModify.localRef;
    const idx = contributions.findIndex((c2) => contribToModify.id === c2.id);
    contributions[idx] = c as SimpleContribution;
  };

  const triggerSubmission = (data: FieldValues) => {
    const newBundle: Partial<ContributionBundle> = {
      contributions: contributions,
      note: data?.note,
      submitter: user!,
    };
    console.log(newBundle);
    onSubmit?.(newBundle);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <>
      <GenericForm
        title={t("cbundle.form.create")}
        onCancel={noPropagationEvt(onCancel)}
        submitLabel={t("cbundle.form.submit")}
        onSubmit={handleSubmit(triggerSubmission)}
        disabled={contributions.length <= 0}
      >
        {/* Add contribution buttons */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("cbundle.form.add")}
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: ContributionTypeEnum.EDITION,
                label: t("cbundle.form.addEdition"),
              },
              {
                key: ContributionTypeEnum.BOOK,
                label: t("cbundle.form.addBook"),
              },
              {
                key: ContributionTypeEnum.SERIE,
                label: t("cbundle.form.addSerie"),
              },
              {
                key: ContributionTypeEnum.ISSUE,
                label: t("cbundle.form.addIssue"),
              },
              {
                key: ContributionTypeEnum.ISSUE_SERIE,
                label: t("cbundle.form.addIssueSerie"),
              },
            ].map(({ key, label }) => (
              <GenericButton
                key={key}
                onClick={noPropagationEvt(() => {
                  setContribToModify(undefined);
                  setLocalRef(undefined);
                  openModal(key);
                })}
                className="bg-white/5 border border-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
              >
                <span className="mr-1 opacity-50">+</span>
                {label}
              </GenericButton>
            ))}
          </div>
        </div>

        {/* Contributions list */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("cbundle.form.newContributions")}
          </span>
          <IndentedContributionList
            contributionList={contributions}
            buttons={{ add: true, edit: true, delete: true }}
            onAdd={createDependantContribution}
            onEdit={editContribution}
            onRemove={removeContribution}
            className="border border-white/10 rounded-md bg-white/5 min-h-[80px]"
          />
        </div>

        {/* Note */}
        <TextAreaRhfInput
          label={t("cbundle.note")}
          registration={register("note")}
          error={errors.note}
        />
      </GenericForm>
      <EditionContributionModal
        edition={
          contribToModify &&
          contribToModify.entityType === ContributionTypeEnum.EDITION
            ? parseToEdition(contribToModify.proposedData)
            : undefined
        }
        bookLocalRef={localRef}
        action="create"
        isOpen={isEditionOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsEditionOpen(false)}
      />
      <BookContributionModal
        book={
          contribToModify &&
          contribToModify.entityType === ContributionTypeEnum.BOOK
            ? parseToBook(contribToModify.proposedData)
            : undefined
        }
        serieLocalRef={localRef}
        action="create"
        isOpen={isBookOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsBookOpen(false)}
      />
      <SerieContributionModal
        serie={
          contribToModify &&
          contribToModify.entityType === ContributionTypeEnum.SERIE
            ? parseToSerie(contribToModify.proposedData)
            : undefined
        }
        action="create"
        isOpen={isSerieOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsSerieOpen(false)}
      />
      <IssueContributionModal
        issue={
          contribToModify &&
          contribToModify.entityType === ContributionTypeEnum.ISSUE
            ? parseToIssue(contribToModify.proposedData)
            : undefined
        }
        issueSerieLocalRef={localRef}
        action="create"
        isOpen={isIssueOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsIssueOpen(false)}
      />
      <IssueSerieContributionModal
        issueSerie={
          contribToModify &&
          contribToModify.entityType === ContributionTypeEnum.ISSUE_SERIE
            ? parseToIssueSerie(contribToModify.proposedData)
            : undefined
        }
        action="create"
        isOpen={isIssueSerieOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsIssueSerieOpen(false)}
      />
    </>
  );
}
