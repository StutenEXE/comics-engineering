import { useEffect, useState } from "react";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { BookList } from "~/components/lists/booklists/BookList";
import { SerieContributionModal } from "~/components/modals/contribution/SerieContributionModal";
import {
  InfoPageSection,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useToast } from "~/components/toast/Toast";
import { useTranslation } from "~/i18n/i18n";
import {
  wrapInNewBundle,
  type SimpleContribution,
} from "~/models/contribution";
import { useAppSelector } from "~/store/hooks";
import {
  useSerieByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { createError } from "~/utils/error";
import type { Route } from "../+types/root";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Serie ${params.id}` },
    { name: "description", content: `Viewing serie ${params.id}` },
  ];
}

export default function SeriePage({ params }: { params: { id: number } }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isFetching, error } = useSerieByIdQuery({
    id: params.id,
  });
  const serie = data?.serie;
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

  // Page title update
  useEffect(() => {
    if (serie?.name) {
      document.title = serie.name;
    }
  }, [serie]);

  const handleEditSubmit = (c: Partial<SimpleContribution>) => {
    // Cannot access function if not connected
    const b = wrapInNewBundle(c, user!);
    submitBundle(b);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openModal = () => setIsEditModalOpen(true);
  const closeModal = () => setIsEditModalOpen(false);

  const subtitle = serie?.oneshot
    ? t("serie.oneshot")
    : t("page.serie.serieOfXVolumes", {
        parameters: { x: serie?.nvolumes },
      });

  return (
    <>
      <InfoPageTemplate hasImg={false} isLoading={isFetching} error={err}>
        <InfoPageHeaderComponent
          headerTitle={t("serie.header")}
          title={serie?.name || ""}
          subtitle={subtitle}
          createdAt={serie?.createdAt}
          modifiedAt={serie?.modifiedAt}
          addedBy={serie?.addedBy?.username}
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
          label={`${t("serie.books")} (${serie?.books.length}/${serie?.nvolumes})`}
          isLoading={isFetching}
        >
          <BookList
            bookList={serie?.books.map((bk) => {
              // Since serie is read-only, its children are too, and we need to have a defined serie here
              // it is not sent back by the API (infinite loops in this case)
              return {
                ...bk,
                serie: { ...serie },
              };
            })}
            className="border border-white/8 rounded-lg"
          />
        </InfoPageSection>
      </InfoPageTemplate>
      <SerieContributionModal
        serie={serie}
        isOpen={isEditModalOpen}
        action="update"
        onSubmit={handleEditSubmit}
        onClose={closeModal}
      />
    </>
  );
}
