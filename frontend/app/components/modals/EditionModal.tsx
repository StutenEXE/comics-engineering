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
import { formatToIsbn } from "~/utils/strings";
import { GenericButton } from "../buttons/GenericButton";
import { InfoPageHeaderComponent } from "../headers/InfoPageHeader";
import {
  InfoPageTemplate,
  InfoPageFields,
} from "../templates/InfoPageTemplate";
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
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  // Main edition data
  const { data, isLoading, error } = useEditionByIdQuery({ id: editionId });
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
        <InfoPageTemplate
          hasImg={true}
          imgUrl={edition?.imgUrl}
          imgAlt={edition?.book?.name}
          isLoading={isLoading}
          error={err}
        >
          <InfoPageHeaderComponent
            headerTitle={t("page.edition.header")}
            headerTitleTo={`/book/${edition?.book?.id}`}
            title={edition?.book?.name || ""}
            subtitle={`${edition?.serie?.name} (#${edition?.book?.number}/${edition?.serie?.nvolumes})`}
            subtitleTo={`/serie/${edition?.book?.serieId}`}
            createdAt={edition?.createdAt}
            modifiedAt={edition?.modifiedAt}
            addedBy={edition?.addedBy?.username}
            onEditClick={() => {
              if (!isAuthenticated) {
                toast.info("toast.notconnected");
                return;
              }
              openEditModal();
            }}
            isLoading={false}
          />

          <InfoPageFields
            isLoading={isLoading}
            fieldProps={[
              // EAN
              { label: t("edition.ean"), value: edition?.ean },
              // ISBN
              {
                label: t("edition.isbn"),
                value: formatToIsbn(edition?.isbn || ""),
              },
              // Publisher
              {
                label: t("edition.publisher"),
                value: edition?.publisher?.name,
                // to: `/publisher/${edition?.publisher?.id}`,
              },
              // Link
              {
                label: t("edition.link"),
                value: edition?.book?.name,
                href: edition?.url,
              },
              // Covertype
              {
                label: t("edition.coverType"),
                value: edition?.coverType
                  ? t(`edition.coverType.${edition?.coverType}`)
                  : undefined,
              },
              // Parutiondate
              {
                label: t("edition.parutionDate"),
                value: edition?.parutionDate.toLocaleDateString(locale),
              },
              // Npages
              {
                label: t("edition.npages"),
                value: edition?.npages,
              },
              // Price
              {
                label: t("edition.price"),
                value: `${edition?.price.toPrecision(4)}€`,
              },
            ]}
          />
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
        </InfoPageTemplate>

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
