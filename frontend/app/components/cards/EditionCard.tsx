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

  // Handles modal open/close state
  const [isModalOpen, setisModalOpen] = useState(false);
  const openModal = () => {
    setisModalOpen(true);
  };

  const closeModal = () => {
    setisModalOpen(false);
  };

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
            // TODO : fix when already added not open modal
            onClick={preventDefaultEvt(
              noPropagationEvt(() => {
                relation?.inCollection && openModal();
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
            alt={`${edition.publisherName}-${edition.parutionDate.getFullYear()}`}
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
            {edition.parutionDate.toLocaleDateString(locale)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {!disableInteractions && (
        <Link
          to={`/edition/${edition.id}`}
          className={`group block ${className}`}
        >
          {generateCard()}
        </Link>
      )}
      {disableInteractions && (
        <div className={`group block ${className}`}>{generateCard()}</div>
      )}

      <AddToCollectionModal
        editionId={edition.id}
        isOpen={isModalOpen}
        onSubmit={onSubmit}
        onClose={closeModal}
      />
    </>
  );
}
