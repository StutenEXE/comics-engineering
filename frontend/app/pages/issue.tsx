import { useEffect, useState } from "react";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookList } from "~/components/lists/booklists/BookList";
import { IssueContributionModal } from "~/components/modals/contribution/IssueContributionModal";
import {
  InfoPageFields,
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import {
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { buildIssueShortName } from "~/models/issue";
import { useAppSelector } from "~/store/hooks";
import {
  useIssueByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Issue ${params.id}` },
    { name: "description", content: `Viewing issue ${params.id}` },
  ];
}

export default function IssuePage({ params }: { params: { id: number } }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useIssueByIdQuery({ id: params.id });
  const issue = data?.issue;
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

  return (
    <>
      <InfoPageTemplate isLoading={isLoading} error={err}>
        <InfoPageHeaderComponent
          headerTitle={t("page.issue.header")}
          title={issue?.name || ""}
          subtitle={buildIssueShortName(issue)}
          subtitleTo={`/issue_serie/${issue?.issueSerie?.id}`}
          createdAt={issue?.createdAt}
          modifiedAt={issue?.modifiedAt}
          addedBy={issue?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info("toast.notconnected");
              return;
            }
            openModal();
          }}
          isLoading={isLoading}
        />

        <InfoPageFields
          isLoading={isLoading}
          fieldProps={[
            // Story
            { label: t("issue.name"), value: issue?.name },
            // Parutiondate
            {
              label: t("issue.parutionDate"),
              labelTooltip: t("issue.parutionDateExplanation"),
              value: dateToVerboseDateString(locale, issue?.parutionDate),
            },
            // Coverdate
            {
              label: t("issue.coverDate"),
              labelTooltip: t("issue.coverDateExplanation"),
              value: dateToMonthYearString(locale, issue?.coverDate),
            },
          ]}
        />

        <InfoPageSection label={t("page.issue.books")} isLoading={isLoading}>
          <BookList
            bookList={issue?.books}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>
      </InfoPageTemplate>
      <IssueContributionModal
        issue={issue}
        action="update"
        isOpen={isEditModalOpen}
        onSubmit={handleEditSubmit}
        onClose={closeModal}
      />
    </>
  );
}
