import { useEffect, useState } from "react";
import { useTranslation } from "~/i18n/i18n";
import {
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import {
  useEditionByIdQuery,
  useEditionRelationToUserQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { createError } from "~/utils/error";
import { GenericButton } from "../buttons/GenericButton";
import { EditionDataDisplay } from "../datadisplay/EditionDataDisplay";
import { useToast } from "../toast/Toast";
import { AddToCollectionModal } from "./AddToCollectionModal";
import { EditionContributionModal } from "./contribution/EditionContributionModal";
import { GenericModal } from "./GenericModal";

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

  // Main edition data
  const { data, isFetching, error } = useEditionByIdQuery({ id: editionId });
  const edition = data?.edition;
  const err = createError(error);

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
  const [submitBundle, { isError, isSuccess }] =
    useSubmitContributionBundleMutation();
  // If error or success occurs during contribution submission
  useEffect(() => {
    if (isError) toast.error(t("contribute.fail"));
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
