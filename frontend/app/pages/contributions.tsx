import { translateApiError } from "~/utils/error";
import { useState } from "react";
import { ContributionBundleModal } from "~/components/modals/contribution/ContributionBundleModal";
import { AdminProtectedRoute } from "~/components/security/AdminProtectedRoute";
import { ContributionBundleTable } from "~/components/tables/ContributionBundleTable";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import {
  type ContributionBundle,
  type SimpleContributionBundle,
} from "~/models/contributionBundle";
import { useUpdateContributionBundleMutation } from "~/store/services/api";
import type { Route } from "../+types/root";
import { ContributionBundleModalWithFetch } from "~/components/modals/contribution/ContributionBundleModalWithFetch";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contributions` },
    { name: "description", content: `Contributions to the library` },
  ];
}

export default function ContributePage() {
  const { t } = useTranslation();
  const toast = useToast();

  // If a bundle is to be edited
  const [bundleToEdit, setBundleToEdit] = useState<SimpleContributionBundle>();

  // Handles contribution modal state
  const [isContributionModalOpen, setisContributionModalOpen] = useState(false);

  const openContributionModal = (bundle: SimpleContributionBundle) => {
    setBundleToEdit(bundle);
    setisContributionModalOpen(true);
  };

  const closeContributionModal = () => {
    setisContributionModalOpen(false);
  };

  const [updateBundle] = useUpdateContributionBundleMutation();

  const updateContributionBundle = async (
    bundle: Partial<ContributionBundle>,
    hasChanges: boolean,
  ) => {
    const resetFormAndClose = () => {
      setBundleToEdit(undefined);
      closeContributionModal();
    };
    if (!hasChanges) {
      resetFormAndClose();
      return;
    }
    updateBundle(bundle)
      .then((res) => {
        if ("error" in res) {
          toast.error(
            translateApiError(res.error, t, "cbundle.toast.updateError"),
          );
          resetFormAndClose();
          return;
        }
        toast.success(t("cbundle.toast.updateSuccess"));
        resetFormAndClose();
      })
      .catch((error) => {
        toast.error(translateApiError(error, t, "cbundle.toast.updateError"));
      });
  };

  return (
    <AdminProtectedRoute>
      <GenericPageTemplate>
        <h1 className="text-3xl font-bold text-gray-200 mb-6">
          {t("contributions.title")}
        </h1>
        <ContributionBundleTable
          addActions
          onContributionClick={openContributionModal}
        />
        <ContributionBundleModalWithFetch
          id={bundleToEdit?.id}
          action="update"
          isOpen={isContributionModalOpen}
          onSubmit={updateContributionBundle}
          onClose={closeContributionModal}
        />
      </GenericPageTemplate>
    </AdminProtectedRoute>
  );
}
