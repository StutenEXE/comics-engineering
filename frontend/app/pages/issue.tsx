import { useIssueByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import {
  InfoPageField,
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
    <InfoPageTemplate>
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-white/30 animate-pulse">
            {t("loader.issue.loading")}
          </p>
        </div>
      )}

      {/* Error */}
      {err && (
        <div className="flex flex-col gap-1 py-12">
          <p className="text-sm text-white/40">{t("loader.issue.error")}</p>
          <p className="text-xs text-rose-400/70 font-mono">
            [{err.status}] {err.details.message}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          <InfoPageHeaderComponent
            headerTitle={t("issue.header")}
            title={issue?.name || ""}
            subtitle={buildIssueShortName(issue)}
            subtitleTo={`/issue_serie/${issue?.issueSerie?.id}`}
            createdAt={issue?.createdAt}
            modifiedAt={issue?.modifiedAt}
            addedBy={issue?.addedBy?.username}
          />

          {/* Metadata grid */}
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 items-baseline">
            <InfoPageField
              label={t("issue.parutionDate")}
              value={dateToVerboseDateString(locale, issue?.parutionDate)}
            />

            <InfoPageField
              label={t("issue.coverDate")}
              value={dateToMonthYearString(locale, issue?.coverDate)}
            />

            <InfoPageField label={t("issue.story")} value={issue?.name} />
          </div>

          <InfoPageSection label={t("issue.books")}>
            <BookList
              bookList={issue?.books}
              className="border border-white/8 rounded-lg"
            />
          </InfoPageSection>
        </>
      )}
    </InfoPageTemplate>
  );
}
