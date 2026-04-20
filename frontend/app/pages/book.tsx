import { useBookByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { InfoPageTemplate } from "~/components/templates/InfoPageTemplate";
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

export default function BookPage({ params }: { params : { id: number}}) {
  const { t } = useTranslation();
  
  // No issues to limit lag, refetch in other component
  const { data, isLoading, error } = useBookByIdQuery({ id: params.id });
  const book = data?.book ?? null;
  const err = createError(error)

  const links: Link[] = [
    { name: t("book.link.serie"), path: `/serie/${book?.serie?.id}`, disabled: isLoading }
  ]

  return (
    <InfoPageTemplate hasImg={true} imgUrl={book?.imgUrl} imgAlt={book?.name} links={links}>
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">{t("loader.book.loading")}</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">{t("loader.book.error")}</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.details.message }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <InfoPageHeaderComponent headerTitle={t("book.header")} title={book?.name} 
            subtitle={`${book?.serie?.name} (#${book?.number}/${book?.serie?.nvolumes})`} 
            createdAt={book?.createdAt} modifiedAt={book?.modifiedAt} addedBy={book?.addedBy?.username} 
            links={links}
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-xl text-gray-200 font-semibold">{t("book.description")} :</h3>
            <p>
              {book?.desc}
            </p>
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">{t("book.sameseries")} :</h3>
            <BookListBySerieId serieId={book?.serie?.id} toIgnore={book}  className="border border-gray-500 rounded-lg" />
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">{t("book.issues")} :</h3>
            <IssueListByBookId bookId={book?.id} className="border border-gray-500 rounded-lg" />
          </div>
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">{t("book.editions")} :</h3>
            <EditionList editionList={book?.editions} className="border border-gray-500 rounded-lg"/>
          </div>
        </>
      )}
    </InfoPageTemplate>
  );
}