import { useState } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleEdition } from "~/models/edition";
import { useAppSelector } from "~/store/hooks";
import {
  useAddToCollectionMutation,
  useEditionRelationToUserQuery,
} from "~/store/services/api";
import { noPropagationEvt, preventDefaultEvt } from "~/utils/events";
import { AddToCollectionIconButton } from "../buttons/AddToCollectionIconButton";
import { AddToCollectionModal } from "../modals/AddToCollectionModal";
import type { OwnedEdition } from "~/models/ownedEdition";
import { EditionModal } from "../modals/EditionModal";
import { toDDmmYYYY } from "~/utils/date";
import dayjs from "dayjs";

type EditionCardProps = {
  edition?: SimpleEdition;
  disableInteractions?: boolean;
  className?: string;
};

export function EditionCard({
  edition,
  disableInteractions,
  className,
}: EditionCardProps) {
  const { locale } = useTranslation();

  // Get edition data
  const { user } = useAppSelector((state) => state.user);
  const { data } = useEditionRelationToUserQuery(
    {
      userId: user ? user.id : 0,
      editionId: edition ? edition.id : 0,
    },
    {
      skip: !user || !edition, // Skip if any of these values aren't defined
    },
  );
  const relation = data?.relation || undefined;

  const onSubmit = () => {
    relation?.inCollection && (relation.inCollection = true);
  };

  // Handles add to collection modal open/close state
  const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] =
    useState(false);
  const openAddToCollectionModal = () => {
    setIsAddToCollectionModalOpen(true);
  };
  const closeAddToCollectionModal = () => {
    setIsAddToCollectionModalOpen(false);
  };

  // Edition modal
  const [isEditionModalOpen, setIsEditionModalOpen] = useState(false);
  const openEditionModal = () => setIsEditionModalOpen(true);
  const closeEditionModal = () => setIsEditionModalOpen(false);

  // If no edition provided, return null (can happen when edition is deleted but still in cache somewhere)
  if (!edition) return null;

  const generateCard = () => {
    return (
      <div
        className={twMerge(
          "h-full relative flex flex-col rounded-lg border border-white/8 bg-white/3 transition-all overflow-hidden",
          !disableInteractions && "hover:border-indigo-500/30 hover:bg-white/5",
        )}
      >
        {!disableInteractions && user && (
          <AddToCollectionIconButton
            onClick={preventDefaultEvt(
              noPropagationEvt(() => {
                !relation?.inCollection && openAddToCollectionModal();
              }),
            )}
            alreadyAdded={relation ? relation.inCollection : false}
            className="absolute z-2 top-1 right-1"
          />
        )}
        {/* Cover */}
        <div className="relative overflow-hidden bg-white/5 aspect-[2/3]">
          <img
            src={edition.imgUrl}
            alt={`${edition.publisherName}-${dayjs(edition.parutionDate).year()}`}
            className={twMerge(
              "w-full h-full object-cover transition-transform duration-300",
              !disableInteractions && "group-hover:scale-105",
            )}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5 px-2.5 py-2">
          <h3 className="text-sm font-medium text-white/80 truncate">
            {edition.publisherName}
          </h3>
          <p className="text-xs text-indigo-300/60">
            {toDDmmYYYY(edition.parutionDate, locale)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={twMerge(
          "group block cursor-pointer",
          className,
          disableInteractions && "cursor-default",
        )}
        onClick={() => !disableInteractions && openEditionModal()}
      >
        {generateCard()}
      </div>

      <AddToCollectionModal
        editionId={edition.id}
        isOpen={isAddToCollectionModalOpen}
        onSubmit={onSubmit}
        onClose={closeAddToCollectionModal}
      />

      <EditionModal
        editionId={edition.id}
        isOpen={isEditionModalOpen}
        onClose={closeEditionModal}
      />
    </>
  );
}
