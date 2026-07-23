import { useTranslation } from "~/i18n/i18n";
import type { Edition } from "~/models/edition";
import type { Error } from "~/utils/error";
import { formatToIsbn } from "~/utils/strings";
import { InfoPageHeaderComponent } from "../headers/InfoPageHeader";
import {
  InfoPageFields,
  InfoPageTemplate,
} from "../templates/InfoPageTemplate";
import type { ReactNode } from "react";
import { Separator } from "../shadcn/ui/separator";
import { formatCurrency } from "~/utils/currency";
import { toDDmmYYYY } from "~/utils/date";

interface EditionDataDisplayProps {
  edition?: Edition;
  onEditClick?: () => void;
  isLoading?: boolean;
  error?: Error;
  className?: string;
  children?: ReactNode;
}

export function EditionDataDisplay({
  edition,
  onEditClick,
  isLoading,
  error,
  className,
  children,
}: EditionDataDisplayProps) {
  const { t, locale } = useTranslation();

  return (
    <InfoPageTemplate
      hasImg={true}
      imgUrl={edition?.imgUrl}
      imgAlt={edition?.book?.name}
      isLoading={isLoading}
      error={error}
      className={className}
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
        onEditClick={onEditClick}
        isLoading={false}
      />
      {children}
      {children && <Separator />}
      <InfoPageFields
        isLoading={isLoading}
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
            // to: `/publisher/${edition?.publisher?.id}`,
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
            value:
              edition?.parutionDate &&
              toDDmmYYYY(edition?.parutionDate, locale),
          },
          // Npages
          {
            label: t("edition.npages"),
            value: edition?.npages,
          },
          // Price
          {
            label: t("edition.price"),
            value: formatCurrency(edition?.price || 0, "EUR", locale),
          },
          // Dimensions
          {
            label: t("edition.dimensions"),
            value: (
              <>
                {t("edition.dimensions.height")}:&nbsp;
                {edition?.dimensions.height.toFixed(2)}&nbsp;cm
                <br />
                {t("edition.dimensions.width")}:&nbsp;
                {edition?.dimensions.width.toFixed(2)}&nbsp;cm
                <br />
                {t("edition.dimensions.thickness")}:&nbsp;
                {edition?.dimensions.thickness.toFixed(2)}&nbsp;cm
              </>
            ),
          },
        ]}
      />
    </InfoPageTemplate>
  );
}
