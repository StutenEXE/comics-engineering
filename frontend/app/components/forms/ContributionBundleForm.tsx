import { useTranslation } from "~/i18n/i18n";
import type {
  Contribution,
  ContributionTree,
  SimpleContribution,
} from "~/models/contribution";
import type { ContributionBundle } from "~/models/contributionBundle";
import { GenericButton } from "../buttons/GenericButton";
import { useConfirm } from "../modals/ConfirmModalProvider";
import { IndentedContributionList } from "../lists/contributionlists/IndentedContributionList";
import { deepCopy } from "~/utils/object";
import { noPropagationEvt } from "~/utils/events";
import { SerieContributionModal } from "../modals/contribution/SerieContributionModal";
import { useState } from "react";

interface ContributionBundleFormProps {
  bundle?: ContributionBundle;
  onSubmit?: () => {};
  onCancel?: () => {};
}

export function ContributionBundleForm({
  bundle,
  onSubmit,
  onCancel,
}: ContributionBundleFormProps) {
  const { t } = useTranslation();
  const confirm = useConfirm();

  const [isSerieOpen, setIsSerieOpen] = useState(false);

  const newBundle = (bundle ? deepCopy(bundle) : {}) as ContributionBundle;

  const openModal = (
    type: "edition" | "book" | "serie" | "issue" | "issueSerie",
  ) => {
    console.log("open modal ", type)
    setIsSerieOpen(false);
    switch (type) {
      case "serie":
        setIsSerieOpen(true);
    }
  };

  const createDependantContribution = (c: SimpleContribution) => {
    switch (
      c.entityType
      // TODO
    ) {
    }
  };

  const editContribution = (c: SimpleContribution) => {
    switch (
      c.entityType
      // TODO
    ) {
    }
  };

  const removeContribution = (c: ContributionTree) => {
    confirm({
      title: t("cbundle.form.remove.title"),
      message: t("cbundle.form.remove.message"),
      onConfirm: () => {
        // Remove all dependencies
        c.children.forEach((c2) => {
          const idx = newBundle.contributions.findIndex(
            (nc) => nc.id === c2.id,
          );
          if (!idx) return;
          newBundle.contributions.splice(idx, 1);
        });
        // Remove contribution
        const idx = newBundle.contributions.findIndex((nc) => nc.id === c.id);
        if (!idx) return;
        newBundle.contributions.splice(idx, 1);
      },
    });
  };

  // TODO
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    console.log(formData);
    onSubmit && onSubmit();
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="w-300 mx-auto p-4 overflow-x-auto">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">{t("cbundle.create")}</h2>
        <div className="flex gap-4">
          <GenericButton
            onClick={noPropagationEvt(() => {
              openModal("edition");
            })}
            className=""
          >
            {t("contribute.addEdition")}
          </GenericButton>
          <GenericButton
            onClick={noPropagationEvt(() => {
              openModal("book");
            })}
            className=""
          >
            {t("contribute.addBook")}
          </GenericButton>
          <GenericButton
            onClick={noPropagationEvt(() => {
              openModal("serie");
            })}
            className=""
          >
            {t("contribute.addSerie")}
          </GenericButton>
          <GenericButton
            onClick={noPropagationEvt(() => {
              openModal("issue");
            })}
            className=""
          >
            {t("contribute.addIssue")}
          </GenericButton>
          <GenericButton onClick={noPropagationEvt(() => {
            openModal('issueSerie')
          })} className="">
            {t("contribute.addIssueSerie")}
          </GenericButton>
        </div>
        <div>
          <h3>{t("cbundle.form.newContributions")}</h3>
          <IndentedContributionList
            contributionList={newBundle.contributions}
            buttons={{ add: true, edit: true, delete: true }}
            onAdd={createDependantContribution}
            onEdit={editContribution}
            onRemove={removeContribution}
            className="border border-gray-500 rounded-lg"
          />
        </div>
        <div>
          <h3>{t("cbundle.form.note")}</h3>
          <textarea name="note" id="note" className="border w-[50%]"></textarea>
        </div>
        <div className="flex justify-between">
          <GenericButton
            onClick={noPropagationEvt(handleCancel)}
            className=" bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400"
          >
            {t("generic.cancel", { capitalize: true })}
          </GenericButton>
          <GenericButton
            type="submit"
            className="font-semibold"
            onClick={noPropagationEvt()}
          >
            {t("bundle.form.submit")}
          </GenericButton>
        </div>
      </div>
      <SerieContributionModal
        isOpen={isSerieOpen}
        onClose={() => setIsSerieOpen(false)}
      />
    </form>
  );
}
