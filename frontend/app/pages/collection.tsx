import { useMemo } from "react";
import { LoggedProtectedRoute } from "~/components/security/LoggedProtectedRoute";
import { OwnedEditionTab } from "~/components/tabs/collection/OwnedEditionTab";
import { Tabs, type TabItem } from "~/components/tabs/Tabs";
import { useTranslation } from "~/i18n/i18n";
import { useAppSelector } from "~/store/hooks";
import { useCollectionQuery } from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Collection` },
    { name: "description", content: `Collection of comics` },
  ];
}

export default function CollectionPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const ownedEd = data?.ownedEditions ?? null;
  const err = createError(error);

  // Group editions by series
  const serieGroups = useMemo(() => {
    if (!ownedEd) return {};
    return ownedEd.reduce(
      (acc, oe) => {
        const serieName =
          oe.edition.serie?.name || t("generic.unknown", { capitalize: true });
        if (!acc[serieName]) {
          acc[serieName] = [];
        }
        acc[serieName].push(oe);
        return acc;
      },
      {} as Record<string, typeof ownedEd>,
    );
  }, [ownedEd, t]);

  const tabs: TabItem[] = [
    {
      id: "editions",
      label: t("editions", { capitalize: true }),
      content: (
        <OwnedEditionTab ownedEditions={ownedEd || []}></OwnedEditionTab>
      ),
    },
    {
      id: "series",
      label: t("series", { capitalize: true }),
      content: (
        <div className="space-y-8">
          {Object.entries(serieGroups).map(([serieName, editions]) => (
            <div key={serieName}>
              <h3 className="text-lg font-semibold mb-3">{serieName}</h3>
              <div className="space-y-2">
                {editions.map((oe) => (
                  <div
                    key={oe.id}
                    className="flex flex-row items-center gap-4 p-3 border rounded dark:border-gray-700"
                  >
                    <img
                      src={oe.edition.imgUrl}
                      alt={oe.edition.book?.name}
                      className="w-16 h-24 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{oe.edition.book?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {oe.edition.publisher?.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        {oe.edition.isbn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <LoggedProtectedRoute>
      <main>
        <div className="flex flex-col items-center pt-3 px-4">
          <h1 className="text-3xl font-bold mb-">{t("collection.title")}</h1>
          {isLoading && <p>{t("loader.collection.loading")}</p>}
          {err && <p className="text-red-500">{err.details.message}</p>}
          <div className="w-full max-w-6xl">
            <Tabs tabs={tabs} defaultTabId="editions" />
          </div>
        </div>
      </main>
    </LoggedProtectedRoute>
  );
}
