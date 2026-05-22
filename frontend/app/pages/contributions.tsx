import { useEffect, useState } from "react";
import { ContributionBundleModal } from "~/components/modals/contribution/ContributionBundleModal";
import { AdminProtectedRoute } from "~/components/security/AdminProtectedRoute";
import { ContributionBundleTable } from "~/components/tables/ContributionBundleTable";
import { useTranslation } from "~/i18n/i18n";
import { type ContributionBundle } from "~/models/contributionBundle";
import {
  useLazyBundleListQuery,
  useUpdateContributionBundleMutation,
} from "~/store/services/api";
import type { Route } from "../+types/root";
import { useToast } from "~/components/toast/Toast";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contributions` },
    { name: "description", content: `Contributions to the library` },
  ];
}

export default function ContributePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const itemsPerPage = 10;

  // If a bundle is to be edited
  const [bundleToEdit, setBundleToEdit] = useState<ContributionBundle>();

  // Handles contribution modal state
  const [isContributionModalOpen, setisContributionModalOpen] = useState(false);

  const openContributionModal = (bundle: ContributionBundle) => {
    setBundleToEdit(bundle);
    setisContributionModalOpen(true);
  };

  const closeContributionModal = () => {
    setisContributionModalOpen(false);
  };

  // List bundles
  const [getBundles, { data }] = useLazyBundleListQuery();
  const handleSearch = (page: number) => {
    const from = page * itemsPerPage;
    const limit = itemsPerPage;
    getBundles({ from, limit });
  };
  // On load, fetch first page of bundles
  useEffect(() => {
    handleSearch(0);
  }, []);

  const [updateBundle] = useUpdateContributionBundleMutation();

  const updateContributionBundle = async (
    bundle: Partial<ContributionBundle>,
  ) => {
    console.log(bundle);
    updateBundle(bundle)
      .then((res) => {
        if ("error" in res) {
          toast.error(t("cbundle.updateError"));
        }
        toast.success(t("cbundle.updateSuccess"));
        setBundleToEdit(undefined);
        closeContributionModal();
      })
      .catch(() => {
        toast.error(t("cbundle.updateError"));
      });
  };

  return (
    <AdminProtectedRoute>
      <main className="flex flex-col items-center pt-8 px-4 lg:px-8 xl:px-12">
        <div className="w-full max-w-6xl space-y-8">
          <h1 className="text-3xl font-bold text-gray-200 mb-6">
            {t("contributions.title")}
          </h1>
        </div>
        <ContributionBundleTable
          bundleList={data?.bundles || []}
          addActions
          onContributionClick={openContributionModal}
          onPageChange={handleSearch}
        />
      </main>
      <ContributionBundleModal
        bundle={bundleToEdit}
        action="update"
        isOpen={isContributionModalOpen}
        onSubmit={updateContributionBundle}
        onClose={closeContributionModal}
      />
    </AdminProtectedRoute>
  );
}
