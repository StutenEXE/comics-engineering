import { useEffect, useState } from "react";
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
import {
  useLazyBundleListQuery,
  useUpdateContributionBundleMutation,
} from "~/store/services/api";
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
  const itemsPerPage = 500;

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

  // List bundles
  const [getBundles, { data, isFetching }] = useLazyBundleListQuery();
  const bundles = data?.bundles;

  const triggerGetBundles = () => {
    const from = 0;
    const limit = itemsPerPage;
    getBundles({ from, limit });
  };

  // On load, fetch first page of bundles
  useEffect(() => {
    if (!bundles) triggerGetBundles();
  }, []);

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
          toast.error(t("cbundle.toast.updateError"));
          resetFormAndClose();
          return;
        }
        toast.success(t("cbundle.toast.updateSuccess"));
        resetFormAndClose();
      })
      .catch(() => {
        toast.error(t("cbundle.toast.updateError"));
      });
  };

  return (
    <AdminProtectedRoute>
      <GenericPageTemplate>
        <h1 className="text-3xl font-bold text-gray-200 mb-6">
          {t("contributions.title")}
        </h1>
        <ContributionBundleTable
          bundleList={bundles || []}
          addActions
          onContributionClick={openContributionModal}
          // onPageChange={setCurrPage}
          onSuccesfulStatusUpdate={triggerGetBundles}
          isLoading={isFetching}
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
