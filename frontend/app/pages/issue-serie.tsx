import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookList } from "~/components/lists/booklists/BookList";
import { IssueList } from "~/components/lists/issuelists/IssueList";
import {
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";
import { useIssueSerieByIdQuery } from "~/store/services/api";
import { dateToMonthYearString } from "~/utils/date";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Issue Serie ${params.id}` },
    { name: "description", content: `Viewing issue serie ${params.id}` },
  ];
}

export default function IssueSeriePage({ params }: { params: { id: number } }) {
  const { t, locale } = useTranslation();

  const { data, isLoading, error } = useIssueSerieByIdQuery({ id: params.id });
  const issueSerie = data?.issueSerie ?? null;
  const err = createError(error);

  const books: SimpleBook[] | undefined = issueSerie?.books;

  let subtitle = dateToMonthYearString(locale, issueSerie?.startDate);
  if (!issueSerie?.endDate) {
    subtitle += ` - ${t("generic.present", { capitalize: true })}`;
  } else if (
    issueSerie?.startDate.getTime() === issueSerie?.endDate.getTime()
  ) {
    subtitle += ` - ${t("generic.oneshot", { capitalize: true })}`;
  } else {
    subtitle += ` - ${dateToMonthYearString(locale, issueSerie?.endDate)}`;
  }

  return (
    <InfoPageTemplate hasImg={false} isLoading={isLoading} error={err}>
      <InfoPageHeaderComponent
        headerTitle={t("page.issueserie.header")}
        title={issueSerie?.name || ""}
        subtitle={subtitle}
        createdAt={issueSerie?.createdAt}
        modifiedAt={issueSerie?.modifiedAt}
        addedBy={issueSerie?.addedBy?.username}
      />

      {issueSerie?.desc && (
        <InfoPageSection label={t("issueserie.description")}>
          <p className="text-sm text-white/60 leading-relaxed">
            {issueSerie.desc}
          </p>
        </InfoPageSection>
      )}

      <InfoPageSection label={t("issueserie.issues")}>
        <IssueList
          issueList={issueSerie?.issues.map((is) => ({
            ...is,
            issueSerie: { ...issueSerie },
          }))}
          className="border border-white/8 rounded-lg"
        />
      </InfoPageSection>

      <InfoPageSection label={t("page.issueserie.books")}>
        <BookList
          bookList={books}
          className="border border-white/8 rounded-lg"
        />
      </InfoPageSection>
    </InfoPageTemplate>
  );
}
