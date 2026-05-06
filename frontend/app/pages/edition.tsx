import { useEditionByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { LinkButton } from "~/components/buttons/LinkButton";
import {
  InfoPageField,
  InfoPageTemplate,
} from "~/components/templates/InfoPageTemplate";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import { useTranslation } from "~/i18n/i18n";
import { Link } from "react-router";
import { formatToIsbn } from "~/utils/strings";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Edition ${params.id}` },
    { name: "description", content: `Viewing edition ${params.id}` },
  ];
}

export default function EditionPage({ params }: { params: { id: number } }) {
  const { t, locale } = useTranslation();
  const { data, isLoading, error } = useEditionByIdQuery({ id: params.id });
  const edition = data?.edition ?? null;
  const err = createError(error);

  return (
    <InfoPageTemplate
      hasImg={true}
      imgUrl={edition?.imgUrl}
      imgAlt={edition?.book?.name}
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-white/30 animate-pulse">
            {t("loader.edition.loading")}
          </p>
        </div>
      )}

      {/* Error */}
      {err && (
        <div className="flex flex-col gap-1 py-12">
          <p className="text-sm text-white/40">{t("loader.edition.error")}</p>
          <p className="text-xs text-rose-400/70 font-mono">
            [{err.status}] {err.details.message}
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          <InfoPageHeaderComponent
            headerTitle={t("edition.header")}
            headerTitleTo={`/book/${edition?.book?.id}`}
            title={edition?.book?.name || ""}
            subtitle={`${edition?.serie?.name} (#${edition?.book?.number}/${edition?.serie?.nvolumes})`}
            subtitleTo={`/serie/${edition?.book?.serieId}`}
            createdAt={edition?.createdAt}
            modifiedAt={edition?.modifiedAt}
            addedBy={edition?.addedBy?.username}
          />

          {/* Metadata grid */}
          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 items-baseline">
            <InfoPageField label={t("edition.ean")} value={edition?.ean} />

            <InfoPageField
              label={t("edition.isbn")}
              value={formatToIsbn(edition?.isbn || "")}
            />

            <InfoPageField
              label={t("edition.publisher")}
              value={edition?.publisher?.name}
              to={`/publisher/${edition?.publisher?.id}`}
            />

            <InfoPageField
              label={t("edition.link")}
              value={edition?.book?.name}
              href={edition?.url}
            />

            <InfoPageField
              label={t("edition.coverType")}
              value={edition?.coverType}
            />

            <InfoPageField
              label={t("edition.parutionDate")}
              value={edition?.parutionDate.toLocaleDateString(locale)}
            />

            <InfoPageField
              label={t("edition.npages")}
              value={edition?.npages}
            />

            <InfoPageField
              label={t("edition.price")}
              value={`${edition?.price.toPrecision(4)}€`}
            />
          </div>
        </>
      )}
    </InfoPageTemplate>
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
