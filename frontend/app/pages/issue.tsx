import { useEffect, useState } from "react";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { IssueContributionModal } from "~/components/modals/contribution/IssueContributionModal";
import {
  InfoPageFields,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import {
  type SimpleContribution,
  wrapInNewBundle,
  ContributionTypeEnum,
} from "~/models/contribution";
import { useHistoryTab } from "~/components/timelines/ContributionHistoryTimeline";
import {
  BookRelationGroup,
  useRelationsTab,
} from "~/components/misc/RelationsPanel";
import { buildIssueShortName } from "~/models/issue";
import { useAppSelector } from "~/store/hooks";
import {
  useIssueByIdQuery,
  useIssueNeighboursQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { IssueNavigation } from "~/components/misc/IssueNavigation";
import { dateToMonthYearString, dateToVerboseDateString } from "~/utils/date";
import { createError, translateApiError } from "~/utils/error";
import type { Route } from "../+types/root";
import { getHostFromFandomUrl, getImgUrlFromFandomUrl } from "~/utils/fandoms";

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

  const { data, isFetching, error } = useIssueByIdQuery({ id: params.id });
  const issue = data?.issue;
  const err = createError(error);

  // Previous & next issues of the same issue serie
  const { data: neighbours, isFetching: isFetchingNeighbours } =
    useIssueNeighboursQuery({ id: params.id });

  // Side panel
  const relationsTab = useRelationsTab({
    count: issue?.books.length ?? 0,
    isLoading: isFetching,
    children: (
      <BookRelationGroup label={t("relations.books")} books={issue?.books} />
    ),
  });
  const historyTab = useHistoryTab(ContributionTypeEnum.ISSUE, issue?.id);

  // Submit a contribution bundle
  const [submitBundle, { isError, isSuccess, error: submitError }] =
    useSubmitContributionBundleMutation();

  // If error or success occurs during contribution submission
  useEffect(() => {
    if (isError)
      toast.error(translateApiError(submitError, t, "contribute.fail"));
  }, [isError]);
  useEffect(() => {
    if (isSuccess) {
      toast.success(t("contribute.success"));
      closeModal();
    }
  }, [isSuccess]);

  // Page title update
  useEffect(() => {
    document.title = buildIssueShortName(issue);
  }, [issue]);

  const handleEditSubmit = (c: Partial<SimpleContribution>) => {
    // Cannot access function if not connected
    const b = wrapInNewBundle(c, user!);
    submitBundle(b);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openModal = () => setIsEditModalOpen(true);
  const closeModal = () => setIsEditModalOpen(false);

  // Reset on fandomUrl change, as the page stays mounted when navigating between issues
  const [imgUrl, setImgUrl] = useState("");
  useEffect(() => {
    setImgUrl("");
    if (issue?.fandomUrl) {
      getImgUrlFromFandomUrl(issue.fandomUrl).then((url) => setImgUrl(url));
    }
  }, [issue?.fandomUrl]);

  return (
    <>
      <InfoPageTemplate
        hasImg={imgUrl !== ""}
        imgUrl={imgUrl}
        isLoading={isFetching}
        error={err}
        sideTabs={[relationsTab, historyTab]}
      >
        <InfoPageHeaderComponent
          headerTitle={t("page.issue.header")}
          title={issue?.name || ""}
          subtitle={buildIssueShortName(issue)}
          subtitleTo={`/issueserie/${issue?.issueSerie?.id}`}
          createdAt={issue?.createdAt}
          modifiedAt={issue?.modifiedAt}
          addedBy={issue?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info(t("toast.notconnected"));
              return;
            }
            openModal();
          }}
          isLoading={isFetching}
        />

        <IssueNavigation
          previous={neighbours?.previous}
          next={neighbours?.next}
          isLoading={isFetchingNeighbours}
        />

        <InfoPageFields
          isLoading={isFetching}
          fieldProps={[
            // Story
            { label: t("issue.name"), value: issue?.name },
            // Issue number
            { label: t("issue.number"), value: issue?.number },
            // Parutiondate
            {
              label: t("issue.parutionDate"),
              labelTooltip: t("issue.parutionDateExplanation"),
              value: dateToVerboseDateString(issue?.parutionDate),
            },
            // Coverdate
            {
              label: t("issue.coverDate"),
              labelTooltip: t("issue.coverDateExplanation"),
              value: dateToMonthYearString(issue?.coverDate),
            },
            // Fandom link
            {
              label: t("issue.fandomUrl"),
              value: getHostFromFandomUrl(issue?.fandomUrl ?? ""),
              href: issue?.fandomUrl,
            },
          ]}
        />
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
