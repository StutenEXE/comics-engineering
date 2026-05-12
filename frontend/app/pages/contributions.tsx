import { AdminProtectedRoute } from "~/components/security/AdminProtectedRoute";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../+types/root";
import { useLazyBundleListQuery } from "~/store/services/api";
import ContributionBundleList from "~/components/lists/contributionbundlelists/ContributionBundleList";
import { ContributionBundleStatusEnum } from "~/models/contributionBundle";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Contributions` },
    { name: "description", content: `Contributions to the library` },
  ];
}

export default function ContributePage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [getBundles, { data }] = useLazyBundleListQuery();
  const handleSearch = (from: number, limit: number) => {
    getBundles({ from, limit });
  };

  return (
    <AdminProtectedRoute>
      <main className="flex flex-col items-center pt-8 px-4 lg:px-8 xl:px-12">
        <div className="w-full max-w-6xl space-y-8">
          <h1 className="text-3xl font-bold text-gray-200 mb-6">
            {t("contributions.title")}
          </h1>
        </div>
        <ContributionBundleList bundles={data?.bundles || []} />
        <button onClick={() => handleSearch(0, 10)}>Fetch</button>
      </main>
    </AdminProtectedRoute>
  );
}
