import { useState } from "react";
import { GenericButton } from "~/components/buttons/GenericButton";
import { ContributionBundleModal } from "~/components/modals/contribution/ContributionBundleModal";
import { ContributionTable } from "~/components/tables/ContributionTable";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import { ContributionStatusEnum } from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import { useContributionBySubmitterIdQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contribute` },
    { name: "description", content: `Contribute to the library` },
  ];
}

export default function ContributePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  // If not auth
  if (!isAuthenticated) {
    return (
      <main>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
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

  // Fetch contributions
  const { data, isLoading, error } = useContributionBySubmitterIdQuery({
    id: user!.id,
  });
  const err = createError(error);
  const contributions = data?.contributions;
  const stats = {
    // Calculate stats
    totalContributions: contributions?.length,
    approved: 0,
    pending: 0,
    rejected: 0,
  };
  contributions?.forEach((contrib) => {
    if (contrib.status === ContributionStatusEnum.APPROVED) stats.approved++;
    else if(contrib.status === ContributionStatusEnum.PENDING) stats.pending++;
    else if (contrib.status === ContributionStatusEnum.REJECTED) stats.rejected++;
  });

  // Handles login modal state
  const [isContributionModalOpen, setisContributionModalOpen] = useState(false);

  const openContributionModal = () => {
    setisContributionModalOpen(true);
  };

  const closeContributionModal = () => {
    setisContributionModalOpen(false);
  };

  return (
    <main className="flex flex-col items-center pt-8 px-4 lg:px-8 xl:px-12">
      <div className="w-full max-w-6xl space-y-8">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-blue-400">
                {stats.totalContributions}
              </p>
              <p className="text-gray-400">{t("contribute.stats.total")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-green-400">
                {stats.approved}
              </p>
              <p className="text-gray-400">{t("contribute.stats.approved")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {stats.pending}
              </p>
              <p className="text-gray-400">{t("contribute.stats.pending")}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <p className="text-3xl font-bold text-red-400">
                {stats.rejected}
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
          <ContributionTable
            contributionList={contributions}
            isLoading={isLoading}
            error={err}
          />
        </div>
      </div>

      <ContributionBundleModal
        isOpen={isContributionModalOpen}
        onClose={closeContributionModal}
      ></ContributionBundleModal>
    </main>
  );
}
