import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import { parseToBook } from "~/models/book";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type ContributionTree,
  type SimpleContribution,
} from "~/models/contribution";
import { type ContributionBundle } from "~/models/contributionBundle";
import { parseToEdition } from "~/models/edition";
import {
  issueToSimpleIssue,
  parseToIssue,
  type Issue,
  type SimpleIssue,
} from "~/models/issue";
import { parseToIssueSerie, type SimpleIssueSerie } from "~/models/issue-serie";
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
import { current } from "@reduxjs/toolkit";

interface ContributionBundleFormProps {
  bundle?: ContributionBundle;
  action: "create" | "update";
  disableNewContributions?: boolean;
  onSubmit?: (bundle: Partial<ContributionBundle>) => void;
  onCancel?: () => void;
  // Returing boolean : didn't create a new contribution in DB
  onContributionAdd?: (
    contribution: SimpleContribution,
  ) => Promise<SimpleContribution | boolean>;
  onContributionEdit?: (
    contribution: SimpleContribution,
  ) => Promise<SimpleContribution | boolean>;
}

export function ContributionBundleForm({
  bundle,
  action,
  disableNewContributions = false,
  onSubmit,
  onCancel,
  onContributionAdd = async () => true,
  onContributionEdit = async () => true,
}: ContributionBundleFormProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { user } = useAppSelector((state) => state.user);

  const schema = z.object({
    note: z.string().default(""),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      note: bundle?.note || "",
    },
  });

  const [isEditionOpen, setIsEditionOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isSerieOpen, setIsSerieOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isIssueSerieOpen, setIsIssueSerieOpen] = useState(false);
  const [contribToModify, setContribToModify] = useState<
    SimpleContribution | undefined
  >(undefined);
  const [localRef, setLocalRef] = useState<
    { id: number; name: string } | undefined
  >(undefined);
  const [contributions, setContributions] = useState<SimpleContribution[]>(
    bundle?.contributions || [],
  );

  const openModal = (type: ContributionTypeEnum) => {
    setIsEditionOpen(false);
    setIsBookOpen(false);
    setIsSerieOpen(false);
    setIsIssueOpen(false);
    setIsIssueSerieOpen(false);

    switch (type) {
      case ContributionTypeEnum.EDITION:
        setIsEditionOpen(true);
        break;
      case ContributionTypeEnum.BOOK:
        setIsBookOpen(true);
        break;
      case ContributionTypeEnum.SERIE:
        setIsSerieOpen(true);
        break;
      case ContributionTypeEnum.ISSUE:
        setIsIssueOpen(true);
        break;
      case ContributionTypeEnum.ISSUE_SERIE:
        setIsIssueSerieOpen(true);
        break;
    }
  };

  const createDependantContribution = (c: SimpleContribution) => {
    setContribToModify(undefined);
    setLocalRef({
      id: c.localRef!,
      name: c.proposedData.name,
    });

    switch (c.entityType) {
      case ContributionTypeEnum.BOOK:
        setIsEditionOpen(true);
        break;
      case ContributionTypeEnum.SERIE:
        setIsBookOpen(true);
        break;
      case ContributionTypeEnum.ISSUE_SERIE:
        setIsIssueOpen(true);
        break;
    }
  };

  const editContribution = (c: SimpleContribution) => {
    setContribToModify(c);
    setLocalRef(undefined);
    openModal(c.entityType);
  };

  const removeContribution = (c: ContributionTree) => {
    const removableIds = new Set<number>([
      c.id,
      ...c.children.map((child) => child.id),
    ]);

    confirm({
      title: t("cbundle.form.remove.title"),
      message: t("cbundle.form.remove.message"),
      onConfirm: () => {
        setContributions((current) =>
          current.filter((contribution) => !removableIds.has(contribution.id)),
        );
      },
    });
  };

  const handleContributionSubmission = (c: Partial<SimpleContribution>) => {
    const submittedContribution = c as SimpleContribution;

    // Not found means the user is adding
    if (!contribToModify) {
      const nextLocalRef = -(contributions.length + 1);
      submittedContribution.id = -nextLocalRef;
      submittedContribution.localRef = nextLocalRef;
      submittedContribution.bundleId = bundle?.id;

      onContributionAdd?.(submittedContribution).then((newContribution) => {
        if (!newContribution) return;
        // If ok, add new contribution to the list
        setContributions((current) => [
          ...current,
          typeof newContribution === "boolean"
            ? submittedContribution
            : (newContribution as SimpleContribution), // if not boolean, means API returned the new contribution
        ]);
      });
      return;
    }
    // Found means the user is editing
    submittedContribution.id = contribToModify.id;
    submittedContribution.localRef = contribToModify.localRef;

    onContributionEdit?.(submittedContribution).then((newContribution) => {
      if (!newContribution) return;
      // If ok, replace the new contribution in the list
      setContributions((current) => {
        return current.map((contribution) =>
          // If contribution.id is the same as submittedContribution.id, replace it with newContribution
          // (if boolean, means no change in DB so keep submittedContribution), else keep the same contribution
          contribution.id === submittedContribution.id
            ? typeof newContribution === "boolean"
              ? submittedContribution
              : (newContribution as SimpleContribution) // if not boolean, means API returned the new contribution
            : contribution,
        );
      });
    });
  };

  const triggerSubmission = (data: FormData) => {
    onSubmit?.({
      contributions,
      note: data.note,
      submitter: user!,
    });
  };

  const localIssueCandidates: SimpleIssue[] = contributions
    .filter((c) => c.entityType === ContributionTypeEnum.ISSUE)
    .map((c) => {
      const issue = c.proposedData as Issue;
      return issueToSimpleIssue({
        ...issue,
        id: c.localRef!,
      });
    });

  const localIssueSeries: SimpleIssueSerie[] = contributions
    .filter((c) => c.entityType === ContributionTypeEnum.ISSUE_SERIE)
    .map((c) => ({
      id: c.localRef!,
      name: c.proposedData.name,
      desc: "",
      startDate: new Date(),
      endDate: null,
    }));

  const modalAction =
    contribToModify?.action === ContributionActionEnum.UPDATE
      ? "update"
      : "create";

  return (
    <>
      <GenericForm
        title={
          action === "update"
            ? t("cbundle.form.title.update")
            : t("cbundle.form.title.create")
        }
        onCancel={noPropagationEvt(onCancel)}
        submitLabel={
          action === "update"
            ? t("cbundle.form.update")
            : t("cbundle.form.create")
        }
        onSubmit={handleSubmit(triggerSubmission)}
        disabled={contributions.length <= 0}
      >
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
                disabled={disableNewContributions}
                className="bg-white/5 border border-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
              >
                <span className="mr-1 opacity-50">+</span>
                {label}
              </GenericButton>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("cbundle.form.newContributions")}
          </span>
          <IndentedContributionList
            contributionList={contributions}
            buttons={{ add: true, edit: true, delete: action === "create" }}
            adminActions={action === "update" && user?.isAdmin}
            onAdd={createDependantContribution}
            onEdit={editContribution}
            onRemove={removeContribution}
            className="border border-white/10 rounded-md bg-white/5 min-h-[80px] min-w-[300px] p-3"
          />
        </div>

        <TextAreaRhfInput
          label={t("cbundle.note")}
          registration={register("note")}
          error={errors.note}
        />
      </GenericForm>

      <EditionContributionModal
        edition={
          contribToModify?.entityType === ContributionTypeEnum.EDITION
            ? parseToEdition(contribToModify.proposedData)
            : undefined
        }
        bookLocalRef={localRef}
        action={modalAction}
        isOpen={isEditionOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsEditionOpen(false)}
      />
      <BookContributionModal
        book={
          contribToModify?.entityType === ContributionTypeEnum.BOOK
            ? parseToBook(contribToModify.proposedData)
            : undefined
        }
        serieLocalRef={localRef}
        action={modalAction}
        isOpen={isBookOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsBookOpen(false)}
        localIssues={localIssueCandidates}
        localIssueSeries={localIssueSeries}
      />
      <SerieContributionModal
        serie={
          contribToModify?.entityType === ContributionTypeEnum.SERIE
            ? parseToSerie(contribToModify.proposedData)
            : undefined
        }
        action={modalAction}
        isOpen={isSerieOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsSerieOpen(false)}
      />
      <IssueContributionModal
        issue={
          contribToModify?.entityType === ContributionTypeEnum.ISSUE
            ? parseToIssue(contribToModify.proposedData)
            : undefined
        }
        issueSerieLocalRef={localRef}
        action={modalAction}
        isOpen={isIssueOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsIssueOpen(false)}
      />
      <IssueSerieContributionModal
        issueSerie={
          contribToModify?.entityType === ContributionTypeEnum.ISSUE_SERIE
            ? parseToIssueSerie(contribToModify.proposedData)
            : undefined
        }
        action={modalAction}
        isOpen={isIssueSerieOpen}
        onSubmit={handleContributionSubmission}
        onClose={() => setIsIssueSerieOpen(false)}
      />
    </>
  );
}
