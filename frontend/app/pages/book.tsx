import { useBookByIdQuery } from "~/store/services/api";
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

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Book ${params.id}` },
    { name: "description", content: `Viewing book ${params.id}` },
  ];
}

export default function BookPage({ params }: { params: { id: number } }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useBookByIdQuery({ id: params.id });
  const book = data?.book ?? null;
  const err = createError(error);

  return (
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
      />

      {/* Description */}
      {book?.desc && (
        <InfoPageSection label={t("book.description")}>
          <p className="text-sm text-white/60 leading-relaxed">{book.desc}</p>
        </InfoPageSection>
      )}

      {/* VO Content */}
      {book?.voContent && (
        <InfoPageSection label={t("book.voContent")}>
          <p className="text-sm text-white/60 leading-relaxed">
            {book.voContent}
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
  );
}
