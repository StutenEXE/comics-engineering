import { useTranslation } from "~/i18n/i18n";
import type { Route } from "../+types/root";
import { useCollectionQuery, useEditionByIdQuery } from "~/store/services/api";
import { useAppSelector } from "~/store/hooks";
import { createError } from "~/utils/error";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Collection` },
    { name: "description", content: `Collection of comics` },
  ];
}

// TODO : logged in protected route
export default function ContributePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useCollectionQuery({ id: user!.id });
  console.log(data);
  const ownedEd = data?.ownedEditions ?? null;
  const err = createError(error);

  return (
    <main>
      <h1 className="text-3xl font-bold mb-4">{t("collection.title")}</h1>
      <p>{t("collection.description")}</p>
      <ul>
        {isLoading && <p>{t("loader.collection.loading")}</p>}
        {ownedEd && ownedEd.map((edition) => (
          <li key={edition.id}>{edition.edition.book?.id}-{edition.edition.book?.name}</li>
        ))}
      </ul>
    </main>
  );
}
