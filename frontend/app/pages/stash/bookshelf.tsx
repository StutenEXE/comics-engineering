import { useEffect, useState } from "react";
import { BsBookshelf } from "react-icons/bs";
import { GenericButton } from "~/components/buttons/GenericButton";
import { OwnedEditionSummary } from "~/components/datadisplay/OwnedEditionSummary";
import { Bookshelf } from "~/components/misc/Bookshelf";
import { OwnedEditionModal } from "~/components/modals/OwnedEditionModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "~/components/shadcn/ui/sheet";
import { SideContentTemplate } from "~/components/templates/SideContentTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";
import { useAppSelector } from "~/store/hooks";
import { useFullCollectionQuery } from "~/store/services/api";
import type { Route } from "../../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Bookshelf` },
    { name: "description", content: `Rendering of you bookshelf` },
  ];
}

// Same as tailwind's lg breakpoint : side panel above, bottom sheet under
const LARGE_SCREEN_QUERY = "(min-width: 64rem)";

function useIsLargeScreen() {
  const [isLarge, setIsLarge] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(LARGE_SCREEN_QUERY);
    const onChange = () => setIsLarge(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isLarge;
}

export default function StashBookshelfPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.user);
  const isLargeScreen = useIsLargeScreen();

  // The bookshelf shows the whole collection
  const { data, isFetching } = useFullCollectionQuery(
    { userId: user ? user.id : 0 },
    { skip: !user },
  );
  const oeditions = data?.ownedEditions;

  const [selectedOe, setSelectedOe] = useState<OwnedEdition>();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // A second click on the selected book puts it back
  const toggleSelection = (oe: OwnedEdition) =>
    setSelectedOe(selectedOe?.id === oe.id ? undefined : oe);

  const summary = selectedOe && (
    <OwnedEditionSummary
      oedition={selectedOe}
      actions={
        <GenericButton
          onClick={() => setIsDetailsModalOpen(true)}
          className="w-full bg-stash-500/15 text-stash-200 hover:bg-stash-500/25 border border-stash-400/20"
        >
          {t("oedition.viewDetails")}
        </GenericButton>
      }
    />
  );

  return (
    <SideContentTemplate title={t("stash.bookshelf")}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Bookshelf
          oeditions={oeditions}
          isLoading={isFetching && !oeditions}
          onClick={toggleSelection}
          selectedId={selectedOe?.id}
          dimensions={{
            shelfWidthCm: 60,
            frameBorderCm: 2,
          }}
        />

        {/* Large screens : sticky panel next to the shelf */}
        <aside className="sticky top-[calc(var(--header-height)+4.5rem)] hidden max-h-[calc(100svh-var(--header-height)-6rem)] overflow-y-auto rounded-xl border border-white/8 bg-white/3 p-5 lg:block">
          {summary ?? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-stash-400/10 text-stash-400">
                <BsBookshelf size={20} aria-hidden />
              </span>
              <p className="text-sm text-white/40">
                {t("stash.bookshelf.selectHint")}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Small screens : bottom sheet, the shelf stays visible behind it */}
      <Sheet
        open={!isLargeScreen && !!selectedOe && !isDetailsModalOpen}
        onOpenChange={(open) => !open && setSelectedOe(undefined)}
      >
        <SheetContent
          side="bottom"
          className="max-h-[85svh] overflow-y-auto rounded-t-2xl border-white/10 bg-neutral-900 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-white"
        >
          {/* Grab handle, signals the sheet can be dismissed */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
          <SheetTitle className="sr-only">{selectedOe?.edition.book?.name}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("stash.bookshelf")}
          </SheetDescription>
          {summary}
        </SheetContent>
      </Sheet>

      {selectedOe && (
        <OwnedEditionModal
          oedition={selectedOe}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </SideContentTemplate>
  );
}
