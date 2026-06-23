import { useEffect, useState } from "react";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookListBySerieId } from "~/components/lists/booklists/BookListBySerieId";
import { EditionList } from "~/components/lists/editionlists/EditionList";
import { IssueListByBookId } from "~/components/lists/issuelists/IssueListByBookId";
import { BookContributionModal } from "~/components/modals/contribution/BookContributionModal";
import {
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import {
  wrapInNewBundle,
  type SimpleContribution,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import {
  useBookByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { createError } from "~/utils/error";
import { insertLinebreaks } from "~/utils/strings";
import type { Route } from "../+types/root";

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

  const { data, isFetching, error } = useBookByIdQuery({ id: params.id });
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

  const subtSuffix = book?.serie?.oneshot
    ? t("serie.oneshot")
    : `#${book?.number}/${book?.serie?.nvolumes}`;
  const subtitle = `${book?.serie?.name} (${subtSuffix})`;

  return (
    <>
      <InfoPageTemplate
        hasImg={true}
        imgUrl={book?.imgUrl}
        imgAlt={book?.name}
        isLoading={isFetching}
        error={err}
      >
        <InfoPageHeaderComponent
          headerTitle={t("page.book.header")}
          title={book?.name || ""}
          subtitle={subtitle}
          subtitleTo={`/serie/${book?.serie?.id}`}
          createdAt={book?.createdAt}
          modifiedAt={book?.modifiedAt}
          addedBy={book?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info(t("toast.notconnected"));
              return;
            }
            openEditModal();
          }}
          isLoading={isFetching}
        />

        {/* Description */}
        <InfoPageSection label={t("book.description")} isLoading={isFetching}>
          <p className="text-sm text-white/60 leading-relaxed">
            {insertLinebreaks(book?.desc)}
          </p>
        </InfoPageSection>

        {/* VO Content */}
        <InfoPageSection label={t("book.voContent")} isLoading={isFetching}>
          <p className="text-sm text-white/60 leading-relaxed">
            {insertLinebreaks(book?.voContent)}
          </p>
        </InfoPageSection>

        {/* Editions */}
        <InfoPageSection label={t("book.editions")} isLoading={isFetching}>
          <EditionList
            editionList={book?.editions}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>

        {/* Same series */}
        <InfoPageSection
          label={t("page.book.sameseries")}
          isLoading={isFetching}
        >
          <BookListBySerieId
            serieId={book?.serie?.id}
            toIgnore={book}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>

        {/* Issues */}
        <InfoPageSection label={t("book.issues")} isLoading={isFetching}>
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
