import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookList } from "~/components/lists/booklists/BookList";
import { IssueList } from "~/components/lists/issuelists/IssueList";
import {
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import type { SimpleBook } from "~/models/book";
import {
  useIssueSerieByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { dateToMonthYearString } from "~/utils/date";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { useToast } from "~/components/toast/Toast";
import {
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import { IssueSerieContributionModal } from "~/components/modals/contribution/IssueSerieContributionModal";

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

  const { data, isLoading, error } = useIssueSerieByIdQuery({ id: params.id });
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
    subtitle += ` - ${t("generic.oneshot", { capitalize: true })}`;
  } else {
    subtitle += ` - ${dateToMonthYearString(locale, issueSerie?.endDate)}`;
  }

  return (
    <>
      <InfoPageTemplate hasImg={false} isLoading={isLoading} error={err}>
        <InfoPageHeaderComponent
          headerTitle={t("page.issueserie.header")}
          title={issueSerie?.name || ""}
          subtitle={subtitle}
          createdAt={issueSerie?.createdAt}
          modifiedAt={issueSerie?.modifiedAt}
          addedBy={issueSerie?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info("toast.notconnected");
              return;
            }
            openModal();
          }}
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
