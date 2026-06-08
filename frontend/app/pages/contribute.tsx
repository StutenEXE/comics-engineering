import { useEffect, useRef, useState } from "react";
import { GenericButton } from "~/components/buttons/GenericButton";
import { ContributionBundleModal } from "~/components/modals/contribution/ContributionBundleModal";
import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import {
  ContributionTable,
  type ContributionTableHandle,
} from "~/components/tables/ContributionTable";
import { GenericPageTemplate } from "~/components/templates/GenericPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import type { ContributionBundle } from "~/models/contributionBundle";
import { useAppSelector } from "~/store/hooks";
import {
  useContributionStatsBySubmitterIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import type { Route } from "../+types/root";
import { ContributionStatusEnum } from "~/models/contribution";
import { createError } from "~/utils/error";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contribute` },
    { name: "description", content: `Contribute to the library` },
  ];
}

export default function ContributePage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  // Submit a contribution bundle
  const [submitBundle, { isError, isSuccess }] =
    useSubmitContributionBundleMutation();

  // If error or success occurs during contribution submission
  useEffect(() => {
    if (isError) toast.error(t("contribute.fail"));
  }, [isError]);
  useEffect(() => {
    if (isSuccess) {
      toast.success(t("contribute.success"));
      closeContributionModal();
    }
  }, [isSuccess]);

  const { data, isLoading, refetch } =
    useContributionStatsBySubmitterIdQuery(
      user ? { id: user.id } : { id: 0 },
      { skip: !user }, // Doesn't execute if user is undefined
    );
  const stats = data?.stats;

  const contributionTableRef = useRef<ContributionTableHandle>(null);

  // Handles contribution modal state
  const [isContributionModalOpen, setisContributionModalOpen] = useState(false);

  // If not auth
  if (!isAuthenticated) {
    return (
      <main>
        <div className="flex flex-col items-center min-h-[50vh] gap-4 mt-12">
          <h1 className="text-3xl font-bold text-gray-200">
            {t("contribute.title")}
          </h1>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center max-w-md">
            <p className="text-xl text-gray-300 mb-4">
              {t("contribute.loginRequired")}
            </p>
            <p className="text-gray-400">{t("contribute.loginRequiredDesc")}</p>
          </div>
        </div>
      </main>
    );
  }

  const openContributionModal = () => {
    setisContributionModalOpen(true);
  };

  const closeContributionModal = () => {
    setisContributionModalOpen(false);
  };

  const submitContributionBundle = async (
    bundle: Partial<ContributionBundle>,
  ) => {
    submitBundle(bundle);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(t("contribute.success"));
      closeContributionModal();
      contributionTableRef.current?.refetch();
    }
  }, [isSuccess]);

  return (
    <LoggedProtectedRoute>
      <GenericPageTemplate>
        <h1 className="text-3xl font-bold text-gray-200 mb-6">
          {t("contribute.title")}
        </h1>

        {/* Welcome message */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-lg">
            {t("contribute.welcome")}{" "}
            <span className="font-semibold text-white">{user?.username}</span>!
          </p>
        </div>

        {/* Contribution options */}
        <div className="flex flex-col gap-5">
          <GenericButton
            onClick={openContributionModal}
            className="w-50 px-6 py-3 bg-green-700 hover:bg-green-600"
          >
            {t("contribute.contribute")}
          </GenericButton>
        </div>

        {/* Statistics */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-200">
            {t("contribute.stats")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-blue-400">
                {stats?.total}
                {/* X */}
              </p>
              <p className="text-gray-400">{t("contribute.stats.total")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-green-400">
                {stats?.approved}
                {/* Y */}
              </p>
              <p className="text-gray-400">{t("contribute.stats.approved")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {stats?.pending}
                {/* Z */}
              </p>
              <p className="text-gray-400">{t("contribute.stats.pending")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-purple-400">
                {stats?.needs_revision}
              </p>
              <p className="text-gray-400">
                {t("contribute.stats.needsRevision")}
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-red-400">
                {stats?.rejected}
              </p>
              <p className="text-gray-400">{t("contribute.stats.rejected")}</p>
            </div>
          </div>
        </div>

        {/* Previous contributions table */}
        <div className="flex flex-col gap-6 pb-8">
          <h2 className="text-2xl font-semibold text-gray-200">
            {t("contribute.history")}
          </h2>
          <ContributionTable ref={contributionTableRef} />
        </div>
        <ContributionBundleModal
          action="create"
          isOpen={isContributionModalOpen}
          onSubmit={submitContributionBundle}
          onClose={closeContributionModal}
        />
      </GenericPageTemplate>
    </LoggedProtectedRoute>
  );
}
