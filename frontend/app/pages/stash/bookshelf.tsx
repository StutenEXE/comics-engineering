import { useState } from "react";
import { OwnedEditionDataDisplay } from "~/components/datadisplay/OwnedEditionDataDisplay";
import { Bookshelf } from "~/components/misc/Bookshelf";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import { useCollectionQuery } from "~/store/services/api";
import type { Route } from "../../+types/root";

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

  const [selectedOe, setSelectedOe] = useState<OwnedEdition | undefined>(
    undefined,
  );

  return (
    <SideContentTemplate title={t("stash.bookshelf")}>
      <div className="flex gap-2">
        <Bookshelf
          oeditions={oeditions}
          isLoading={isFetching}
          onClick={(oe) => setSelectedOe(oe)}
          className="w-[45%]"
          dimensions={{
            shelfWidthCm: 60,
            frameBorderCm: 2,
          }}
        />

        {selectedOe && (
          <OwnedEditionDataDisplay
            oedition={selectedOe}
            className="w-[55%] m-0 p-0"
          ></OwnedEditionDataDisplay>
        )}
      </div>
    </SideContentTemplate>
  );
}
