import { useCollectionQuery } from "~/store/services/api";
import type { Route } from "../../+types/root";
import { useAppSelector } from "~/store/hooks";
import { useTranslation } from "~/i18n/i18n";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { Bookshelf } from "~/components/misc/Bookshelf";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Bookshelf` },
    { name: "description", content: `Rendering of you bookshelf` },
  ];
}

export default function StashBookshelfPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);

  const { data, isFetching } = useCollectionQuery(
    user ? { id: user.id } : { id: 0 },
    { skip: !user },
  );
  const oeditions = data?.ownedEditions;

  return (
    <SideContentTemplate title={t("stash.bookshelf")}>
      <Bookshelf oeditions={oeditions} isLoading={isFetching} />
    </SideContentTemplate>
  );
}
