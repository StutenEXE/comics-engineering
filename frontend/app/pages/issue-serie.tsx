import { useEffect, useState } from "react";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookList } from "~/components/lists/booklists/BookList";
import { IssueList } from "~/components/lists/issuelists/IssueList";
import { IssueSerieContributionModal } from "~/components/modals/contribution/IssueSerieContributionModal";
import {
  InfoPageFields,
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";
import {
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import {
  useIssueSerieByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
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
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isFetching, error } = useIssueSerieByIdQuery({ id: params.id });
  const issueSerie = data?.issueSerie;
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
      closeModal();
    }
  }, [isSuccess]);

  const handleEditSubmit = (c: Partial<SimpleContribution>) => {
    // Cannot access function if not connected
    const b = wrapInNewBundle(c, user!);
    submitBundle(b);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openModal = () => setIsEditModalOpen(true);
  const closeModal = () => setIsEditModalOpen(false);

  const books: SimpleBook[] | undefined = issueSerie?.books;

  let subtitle = dateToMonthYearString(locale, issueSerie?.startDate);
  if (!issueSerie?.endDate) {
    subtitle += ` - ${t("generic.present", { capitalize: true })}`;
  } else if (
    issueSerie?.startDate.getTime() === issueSerie?.endDate.getTime()
  ) {
    subtitle += ` - ${t("serie.oneshot")}`;
  } else {
    subtitle += ` - ${dateToMonthYearString(locale, issueSerie?.endDate)}`;
  }

  return (
    <>
      <InfoPageTemplate hasImg={false} isLoading={isFetching} error={err}>
        <InfoPageHeaderComponent
          headerTitle={t("page.issueserie.header")}
          title={issueSerie?.name || ""}
          subtitle={subtitle}
          createdAt={issueSerie?.createdAt}
          modifiedAt={issueSerie?.modifiedAt}
          addedBy={issueSerie?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info(t("toast.notconnected"));
              return;
            }
            openModal();
          }}
          isLoading={isFetching}
        />

        <InfoPageSection
          label={t("issueserie.description")}
          isLoading={isFetching}
        >
          <p className="text-sm text-white/60 leading-relaxed">
            {issueSerie?.desc}
          </p>
        </InfoPageSection>

        <InfoPageSection
          label={t("issueserie.fandomUrl")}
          isLoading={isFetching}
        >
          {!issueSerie?.fandomUrl && (
            <p className="text-sm text-white/60 leading-relaxed">
              {t("generic.unknown")}
            </p>
          )}
          {issueSerie?.fandomUrl && (
            <a
              href={issueSerie?.fandomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-300/70 hover:underline hover:text-indigo-300 transition-colors truncate"
            >
              {/* https://[xxx.fandom.com]/wiki/xxxxxxx */}
              {issueSerie?.fandomUrl?.split("/")[2]}&nbsp;↗
            </a>
          )}
        </InfoPageSection>

        <InfoPageSection label={t("issueserie.issues")} isLoading={isFetching}>
          <IssueList
            issueList={issueSerie?.issues.map((is) => ({
              ...is,
              issueSerie: { ...issueSerie },
            }))}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>

        <InfoPageSection
          label={t("page.issueserie.books")}
          isLoading={isFetching}
        >
          <BookList
            bookList={books}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>
      </InfoPageTemplate>
      <IssueSerieContributionModal
        issueSerie={issueSerie}
        action="update"
        isOpen={isEditModalOpen}
        onSubmit={handleEditSubmit}
        onClose={closeModal}
      />
    </>
  );
}
