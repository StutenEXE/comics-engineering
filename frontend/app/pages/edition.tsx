import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import {
  InfoPageField,
  InfoPageFields,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { useTranslation } from "~/i18n/i18n";
import {
  useEditionByIdQuery,
  useSubmitContributionBundleMutation,
} from "~/store/services/api";
import { createError } from "~/utils/error";
import { formatToIsbn } from "~/utils/strings";
import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import {
  type SimpleContribution,
  wrapInNewBundle,
} from "~/models/contribution";
import { useToast } from "~/components/toast/Toast";
import { useAppSelector } from "~/store/hooks";
import { EditionContributionModal } from "~/components/modals/contribution/EditionContributionModal";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Edition ${params.id}` },
    { name: "description", content: `Viewing edition ${params.id}` },
  ];
}

export default function EditionPage({ params }: { params: { id: number } }) {
  const { t, locale } = useTranslation();
  const toast = useToast();
  const { user, isAuthenticated } = useAppSelector((state) => state.user);

  const { data, isLoading, error } = useEditionByIdQuery({ id: params.id });
  const edition = data?.edition;
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

  // Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const openModal = () => setIsEditModalOpen(true);
  const closeModal = () => setIsEditModalOpen(false);

  const handleEditSubmit = (c: Partial<SimpleContribution>) => {
    // Cannot access function if not connected
    const b = wrapInNewBundle(c, user!);
    submitBundle(b);
  };

  return (
    <>
      <InfoPageTemplate
        hasImg={true}
        imgUrl={edition?.imgUrl}
        imgAlt={edition?.book?.name}
        isLoading={isLoading}
        error={err}
      >
        <InfoPageHeaderComponent
          headerTitle={t("page.edition.header")}
          headerTitleTo={`/book/${edition?.book?.id}`}
          title={edition?.book?.name || ""}
          subtitle={`${edition?.serie?.name} (#${edition?.book?.number}/${edition?.serie?.nvolumes})`}
          subtitleTo={`/serie/${edition?.book?.serieId}`}
          createdAt={edition?.createdAt}
          modifiedAt={edition?.modifiedAt}
          addedBy={edition?.addedBy?.username}
          onEditClick={() => {
            if (!isAuthenticated) {
              toast.info("toast.notconnected");
              return;
            }
            openModal();
          }}
        />

        <InfoPageFields
          fieldProps={[
            // EAN
            { label: t("edition.ean"), value: edition?.ean },
            // ISBN
            {
              label: t("edition.isbn"),
              value: formatToIsbn(edition?.isbn || ""),
            },
            // Publisher
            {
              label: t("edition.publisher"),
              value: edition?.publisher?.name,
              to: `/publisher/${edition?.publisher?.id}`,
            },
            // Link
            {
              label: t("edition.link"),
              value: edition?.book?.name,
              href: edition?.url,
            },
            // Covertype
            {
              label: t("edition.coverType"),
              value: edition?.coverType
                ? t(`edition.coverType.${edition?.coverType}`)
                : undefined,
            },
            // Parutiondate
            {
              label: t("edition.parutionDate"),
              value: edition?.parutionDate.toLocaleDateString(locale),
            },
            // Npages
            {
              label: t("edition.npages"),
              value: edition?.npages,
            },
            // Price
            {
              label: t("edition.price"),
              value: `${edition?.price.toPrecision(4)}€`,
            },
          ]}
        />
      </InfoPageTemplate>
      <EditionContributionModal
        edition={edition}
        action="update"
        isOpen={isEditModalOpen}
        onSubmit={handleEditSubmit}
        onClose={closeModal}
      />
    </>
  );
}

// ── Local helpers ──────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-widest text-white/30 whitespace-nowrap">
      {children}
    </span>
  );
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-white/70">{children}</span>;
}
