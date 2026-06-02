import {
  useBookByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import {
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { EditionList } from "~/components/lists/editionlists/EditionList";
import type { Link } from "~/components/lists/LinkButtonList";
import { BookListBySerieId } from "~/components/lists/booklists/BookListBySerieId";
import { IssueListByBookId } from "~/components/lists/issuelists/IssueListByBookId";
import { useTranslation } from "~/i18n/i18n";
import { insertLinebreaks } from "~/utils/strings";
import { BookContributionModal } from "~/components/modals/contribution/BookContributionModal";
import { useToast } from "~/components/toast/Toast";
import { useAppSelector } from "~/store/hooks";
import { useEffect, useState } from "react";
import {
  wrapInNewBundle,
  type SimpleContribution,
} from "~/models/contribution";
import { EditionModal } from "~/components/modals/EditionModal";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Book ${params.id}` },
    { name: "description", content: `Viewing book ${params.id}` },
  ];
}

export default function BookPage({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useBookByIdQuery({ id: params.id });
  const book = data?.book;
  const err = createError(error);

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

  return (
    <>
      <InfoPageTemplate
        hasImg={true}
        imgUrl={book?.imgUrl}
        imgAlt={book?.name}
        isLoading={isLoading}
        error={err}
      >
        <InfoPageHeaderComponent
          headerTitle={t("page.book.header")}
          title={book?.name || ""}
          subtitle={`${book?.serie?.name} (#${book?.number}/${book?.serie?.nvolumes})`}
          subtitleTo={`/serie/${book?.serie?.id}`}
          createdAt={book?.createdAt}
          modifiedAt={book?.modifiedAt}
          addedBy={book?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info("toast.notconnected");
              return;
            }
            openEditModal();
          }}
        />

        {/* Description */}
        {book?.desc && (
          <InfoPageSection label={t("book.description")}>
            <p className="text-sm text-white/60 leading-relaxed">
              {insertLinebreaks(book.desc)}
            </p>
          </InfoPageSection>
        )}

        {/* VO Content */}
        {book?.voContent && (
          <InfoPageSection label={t("book.voContent")}>
            <p className="text-sm text-white/60 leading-relaxed">
              {insertLinebreaks(book.voContent)}
            </p>
          </InfoPageSection>
        )}

        {/* Editions */}
        <InfoPageSection label={t("book.editions")}>
          <EditionList
            editionList={book?.editions}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>

        {/* Same series */}
        <InfoPageSection label={t("page.book.sameseries")}>
          <BookListBySerieId
            serieId={book?.serie?.id}
            toIgnore={book}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>

        {/* Issues */}
        <InfoPageSection label={t("book.issues")}>
          <IssueListByBookId
            bookId={book?.id}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>
      </InfoPageTemplate>

      <BookContributionModal
        book={book}
        isOpen={isEditModalOpen}
        action="update"
        onSubmit={handleEditSubmit}
        onClose={closeEditModal}
      />
    </>
  );
}
