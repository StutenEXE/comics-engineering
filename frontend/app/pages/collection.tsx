import { useMemo } from "react";
import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import { OwnedEditionTab } from "~/components/tabs/collection/OwnedEditionTab";
import { Tabs, type TabItem } from "~/components/tabs/Tabs";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import { useCollectionQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";
import { OwnedSeriesTab } from "~/components/tabs/collection/OwnedSeriesTab";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Collection` },
    { name: "description", content: `Collection of comics` },
  ];
}

export default function CollectionPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const tabs: TabItem[] = [
    {
      id: "editions",
      label: t("editions", { capitalize: true }),
      content: <OwnedEditionTab />,
    },
    {
      id: "series",
      label: t("series", { capitalize: true }),
      content: <OwnedSeriesTab />,
    },
  ];

  return (
    <LoggedProtectedRoute>
      <main className="flex flex-col items-center pt-8 px-4 lg:px-8 xl:px-12">
        <div className="w-full max-w-6xl space-y-8">
          <h1 className="text-3xl font-bold text-gray-200 mb-6">
            {t("collection.title")}
          </h1>
          <div className="w-full max-w-6xl">
            <Tabs tabs={tabs} defaultTabId="editions" />
          </div>
        </div>
      </main>
    </LoggedProtectedRoute>
  );
}
