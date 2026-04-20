import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookList } from "~/components/lists/booklists/BookList";
import { InfoPageTemplate } from "~/components/templates/InfoPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import { useSerieByIdQuery } from "~/store/services/api";
import { dateToMonthYearString } from "~/utils/date";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Serie ${params.id}` },
    { name: "description", content: `Viewing serie ${params.id}` },
  ];
}

export default function IssueSeriePage({ params }: { params : { id: number}}) {
  const { t, locale } = useTranslation();
  
  const { data, isLoading, error } = useSerieByIdQuery({ id: params.id });
  const serie = data?.serie ?? null;
  const err = createError(error)

  let subtitle = dateToMonthYearString(locale, serie?.startDate)
    if (!serie?.endDate && serie?.ongoing) { subtitle += ` - ${t("generic.present", { capitalize: true })}` }
    else if (serie?.oneshot) {
      subtitle += ` - ${t("generic.oneshot", { capitalize: true })}`
    }
    else {
      subtitle += ` - ${dateToMonthYearString(locale, serie?.endDate)}`
    }

  return (
    <InfoPageTemplate hasImg={false}>
      { isLoading && (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl text-gray-500">{t("loader.serie.loading")}</h1>
        </div>
      )}
      { err && (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl text-gray-500">{t("loader.serie.error")}</h1>
            <h3 className="text-xl text-red-400">
              [Code: {err.status}] { err.details.message }
            </h3> 
        </div>
      )}
      { (!isLoading && !error) && (
        <>
          <InfoPageHeaderComponent headerTitle={t("serie.header")} title={serie?.name} subtitle={subtitle} 
            createdAt={serie?.createdAt} modifiedAt={serie?.modifiedAt} addedBy={serie?.addedBy?.username} />
          <div className="flex gap-2 flex-col">
            <h3 className="text-xl text-gray-200 font-semibold">{t("serie.books")} ({serie?.books.length}/{serie?.ongoing ? "?" : serie?.nvolumes}) :</h3>
            <BookList bookList={serie?.books.map((bk) => {
                  // Since serie is read-only, it's children are too, and we need to have a defined serie here
                  // it is not sent back by the API (infinite loops in this case)
                  return {
                    ...bk,
                    serie: {...serie}
                  }
              })} className="border border-gray-500 rounded-lg"/>
          </div>
        </>
      )}
    </InfoPageTemplate>
  );
}