import { useState, type SetStateAction } from "react";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionTypeEnum,
  type ContributionTree,
  type SimpleContribution,
} from "~/models/contribution";
import { type ContributionBundle } from "~/models/contributionBundle";
import { noPropagationEvt, preventDefaultEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import { IndentedContributionList } from "../lists/contributionlists/IndentedContributionList";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { SerieContributionModal } from "../modals/contribution/SerieContributionModal";
import { parseToSerie, type Serie } from "~/models/serie";
import { parseToBook } from "~/models/book";
import { BookContributionModal } from "../modals/contribution/BookContributionModal";
import z from "zod";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextAreaRhfInput } from "./fields/TextAreaRhfInput";

interface ContributionBundleFormProps {
  bundle?: ContributionBundle;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ContributionBundleForm({
  bundle,
  onSubmit,
  onCancel,
}: ContributionBundleFormProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();

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
  const [isSerieOpen, setIsSerieOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);

  // Bundle data
  const [contributions, setContributions] = useState(
    [] as SimpleContribution[],
  );

  // Contribution data
  const [contribToModify, setContribToModify] = useState<
    SimpleContribution | undefined
  >(undefined);
  const [localRef, setLocalRef] = useState<number | undefined>(undefined);

  const openModal = (type: ContributionTypeEnum) => {
    setIsBookOpen(false);
    setIsSerieOpen(false);
    switch (type) {
      case ContributionTypeEnum.BOOK:
        return setIsBookOpen(true);
      case ContributionTypeEnum.SERIE:
        return setIsSerieOpen(true);
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
    switch (c.entityType) {
      case ContributionTypeEnum.SERIE:
        setLocalRef(c.localRef);
        return setIsBookOpen(true);
    }
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

  // TODO
  const triggerSubmission = (data: FieldValues) => {
    const newBundle: Partial<ContributionBundle> = {
      contributions: contributions,
      note: data?.note,
    };
    console.log(newBundle);
    onSubmit?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(triggerSubmission)}
        className="flex flex-col gap-6 p-6"
      >
        {/* Title */}
        <h2 className="text-lg font-semibold tracking-wide text-white/90 text-center border-b border-white/10 pb-4">
          {t("cbundle.create")}
        </h2>

        {/* Add contribution buttons */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("contribute.add")}
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: ContributionTypeEnum.EDITION,
                label: t("contribute.addEdition"),
              },
              {
                key: ContributionTypeEnum.BOOK,
                label: t("contribute.addBook"),
              },
              {
                key: ContributionTypeEnum.SERIE,
                label: t("contribute.addSerie"),
              },
              {
                key: ContributionTypeEnum.ISSUE,
                label: t("contribute.addIssue"),
              },
              {
                key: ContributionTypeEnum.ISSUE_SERIE,
                label: t("contribute.addIssueSerie"),
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
          label={t("cbundle.form.note")}
          registration={register("note")}
          error={errors.note}
        />
        
        {/* Actions */}
        <div className="flex justify-between gap-3 pt-2 border-t border-white/10">
          <GenericButton
            onClick={noPropagationEvt(handleCancel)}
            className="flex-1 bg-white/5 border border-white/10 text-white/60 font-medium text-sm py-2 rounded-md hover:bg-white/10 hover:text-white/80 transition-all"
          >
            {t("generic.cancel", { capitalize: true })}
          </GenericButton>
          <GenericButton
            type="submit"
            disabled={contributions.length <= 0}
            onClick={noPropagationEvt()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("bundle.form.submit")}
          </GenericButton>
        </div>
      </form>
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
    </>
  );
}
