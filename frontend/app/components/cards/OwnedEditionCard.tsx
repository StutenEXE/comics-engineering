import { useState } from "react";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleOwnedEdition } from "~/models/ownedEdition";
import { OwnedEditionModal } from "../modals/OwnedEditionModal";
import { useOwnedEditionByIdQuery } from "~/store/services/api";
import { toDDmmYYYY } from "~/utils/date";
import dayjs from "dayjs";

type OwnedEditionCardProps = {
  simpleOedition?: SimpleOwnedEdition;
  className?: string;
};

export function OwnedEditionCard({
  simpleOedition,
  className,
}: OwnedEditionCardProps) {
  const { locale } = useTranslation();

  const { data, isFetching } = useOwnedEditionByIdQuery(
    { id: simpleOedition?.id || 0 },
    { skip: !simpleOedition?.id },
  );
  const oedition = data?.ownedEdition;

  // Owned edition modal
  const [isOeditionModalOpen, setIsOeditionModalOpen] = useState(false);
  const openOeditionModal = () => setIsOeditionModalOpen(true);
  const closeOeditionModal = () => setIsOeditionModalOpen(false);

  // If no edition provided, return null (can happen when edition is deleted but still in cache somewhere)
  if (!simpleOedition || !oedition) return null;

  return (
    <>
      <div
        onClick={() => openOeditionModal()}
        className="group block cursor-pointer h-full relative flex flex-col rounded-lg border border-white/8 bg-white/3 
        transition-all overflow-hidden hover:border-indigo-500/30 hover:bg-white/5 cursor-pointer"
      >
        {/* Cover */}
        <div className="relative overflow-hidden bg-white/5 aspect-[2/3]">
          <img
            src={oedition.edition.imgUrl}
            alt={`${oedition.edition.publisher?.name}-${dayjs(oedition.edition.parutionDate).year()}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 px-2.5 py-2">
          <h3 className="text-sm font-medium text-white/80 truncate">
            {oedition.edition.publisher?.name}
          </h3>
          <p className="text-xs text-indigo-300/60">
            {toDDmmYYYY(oedition.edition.parutionDate, locale)}
          </p>
        </div>
      </div>

      <OwnedEditionModal
        oedition={oedition}
        isOpen={isOeditionModalOpen}
        onClose={closeOeditionModal}
      />
    </>
  );
}
