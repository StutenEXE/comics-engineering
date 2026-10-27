import { useEffect, useState } from "react";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionTypeEnum,
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import {
  useBookByIdQuery,
  useEditionByIdQuery,
  useEditionRelationToUserQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { createError, translateApiError } from "~/utils/error";
import { GenericButton } from "../buttons/GenericButton";
import { EditionDataDisplay } from "../datadisplay/EditionDataDisplay";
import { useToast } from "../toast/Toast";
import { AddToCollectionModal } from "./AddToCollectionModal";
import { EditionContributionModal } from "./contribution/EditionContributionModal";
import { GenericModal } from "./GenericModal";
import { useHistoryTab } from "../timelines/ContributionHistoryTimeline";
import {
  EditionRelationGroup,
  useRelationsTab,
} from "../misc/RelationsPanel";

interface EditionModalProps {
  editionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function EditionModal({
  editionId,
  isOpen,
  onClose,
}: EditionModalProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  // Edition shown : clicking another edition of the same book replaces it in place
  // (instead of stacking modals), back to the given one on reopening
  const [currentId, setCurrentId] = useState(editionId);
  useEffect(() => {
    if (isOpen) setCurrentId(editionId);
  }, [isOpen, editionId]);

  // Main edition data
  const { data, isFetching, error } = useEditionByIdQuery({ id: currentId });
  const edition = data?.edition;
  const err = createError(error);

  // Other editions of the same book (skipped while closed, as every edition card holds a modal)
  const { data: bookData, isFetching: isFetchingBook } = useBookByIdQuery(
    { id: edition?.book?.id ?? 0 },
    { skip: !isOpen || !edition?.book },
  );
  const otherEditions = bookData?.book.editions.filter(
    (ed) => ed.id !== edition?.id,
  );

  // Side panel
  const relationsTab = useRelationsTab({
    count: otherEditions?.length ?? 0,
    isLoading: isFetching || isFetchingBook,
    children: (
      <EditionRelationGroup
        label={t("relations.edition.otherEditions")}
        editions={otherEditions}
        onEditionClick={(ed) => {
          setCurrentId(ed.id);
          // The clicked card is focused : back to the top of its dialog
          document.activeElement
            ?.closest('[role="dialog"]')
            ?.scrollTo({ top: 0 });
        }}
      />
    ),
  });
  // Same as above : not fetched while closed
  const historyTab = useHistoryTab(
    ContributionTypeEnum.EDITION,
    isOpen ? edition?.id : undefined,
  );

  // Relation to user check (for collection status)
  const { data: relationData } = useEditionRelationToUserQuery(
    {
      userId: user ? user.id : 0,
      editionId: edition ? edition.id : 0,
    },
    {
      skip: !isAuthenticated || !edition, // Skip if any of these values aren't defined
    },
  );
  const relation = relationData?.relation || undefined;

  // Submit a contribution bundle
  const [submitBundle, { isError, isSuccess, error: submitError }] =
    useSubmitContributionBundleMutation();
  // If error or success occurs during contribution submission
  useEffect(() => {
    if (isError)
      toast.error(translateApiError(submitError, t, "contribute.fail"));
  }, [isError]);
  useEffect(() => {
    if (isSuccess) {
      toast.success(t("contribute.success"));
      closeEditModal();
    }
  }, [isSuccess]);

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleEditSubmit = (c: Partial<SimpleContribution>) => {
    // Cannot access function if not connected
    const b = wrapInNewBundle(c, user!);
    submitBundle(b);
  };

  // Handles modal open/close state
  const [isAddToCollectionModalOpen, setisAddToCollectionModalOpen] =
    useState(false);
  const openAddToCollectionModal = () => {
    setisAddToCollectionModalOpen(true);
  };
  const closeAddToCollectionModal = () => {
    setisAddToCollectionModalOpen(false);
  };
  const onAddToCollectionSubmit = () => {
    relation && (relation.inCollection = true);
  };
  return (
    <>
      <GenericModal isOpen={isOpen} onClose={onClose}>
        <EditionDataDisplay
          edition={edition}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info(t("toast.notconnected"));
              return;
            }
            openEditModal();
          }}
          isLoading={isFetching}
          error={err}
          sideTabs={[relationsTab, historyTab]}
          // The modal scrolls on its own and is at most 37.5rem high (max-h-150)
          asideClassName="top-0 max-h-[33rem]"
        >
          {isAuthenticated && (
            <GenericButton
              onClick={openAddToCollectionModal}
              disabled={relation?.inCollection}
            >
              {relation?.inCollection
                ? t("edition.inCollection")
                : t("edition.addToCollection")}
            </GenericButton>
          )}
        </EditionDataDisplay>
        <EditionContributionModal
          edition={edition}
          action="update"
          isOpen={isEditModalOpen}
          onSubmit={handleEditSubmit}
          onClose={closeEditModal}
        />
      </GenericModal>
      {edition && (
        <AddToCollectionModal
          editionId={edition.id}
          isOpen={isAddToCollectionModalOpen}
          onSubmit={onAddToCollectionSubmit}
          onClose={closeAddToCollectionModal}
        />
      )}
    </>
  );
}
