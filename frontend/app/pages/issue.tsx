import { useIssueByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import {
  InfoPageField,
  InfoPageFields,
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { buildIssueShortName } from "~/models/issue";
import { BookList } from "~/components/lists/booklists/BookList";
import type { Link } from "~/components/lists/LinkButtonList";
import { useTranslation } from "~/i18n/i18n";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Issue ${params.id}` },
    { name: "description", content: `Viewing issue ${params.id}` },
  ];
}

export default function IssuePage({ params }: { params: { id: number } }) {
  const { t, locale } = useTranslation();

  const { data, isLoading, error } = useIssueByIdQuery({ id: params.id });
  const issue = data?.issue ?? null;
  const err = createError(error);

  return (
    <InfoPageTemplate isLoading={isLoading} error={err}>
      <InfoPageHeaderComponent
        headerTitle={t("page.issue.header")}
        title={issue?.name || ""}
        subtitle={buildIssueShortName(issue)}
        subtitleTo={`/issue_serie/${issue?.issueSerie?.id}`}
        createdAt={issue?.createdAt}
        modifiedAt={issue?.modifiedAt}
        addedBy={issue?.addedBy?.username}
      />

      <InfoPageFields
        fieldProps={[
          // Story
          { label: t("issue.name"), value: issue?.name },
          // Parutiondate
          {
            label: t("issue.parutionDate"),
            value: dateToVerboseDateString(locale, issue?.parutionDate),
          },
          // Coverdate
          {
            label: t("issue.coverDate"),
            value: dateToVerboseDateString(locale, issue?.coverDate),
          },
        ]}
      />

      <InfoPageSection label={t("page.issue.books")}>
        <BookList
          bookList={issue?.books}
          className="border border-white/8 rounded-lg"
        />
      </InfoPageSection>
    </InfoPageTemplate>
  );
}
