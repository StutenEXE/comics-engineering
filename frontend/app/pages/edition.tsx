import { useEditionByIdQuery } from "~/store/services/api";
import type { Route } from "../+types/root";
import { createError } from "~/utils/error";
import { LinkButton } from "~/components/buttons/LinkButton";
import { InfoPageTemplate } from "~/components/templates/InfoPageTemplate";
import { InfoPageHeaderComponent } from "~/components/headers/InfoPageHeader";
import type { Link } from "~/components/lists/LinkButtonList";
import { useTranslation } from "~/i18n/i18n";

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

  const links: Link[] = [
    {
      name: t("edition.link.book"),
      path: `/book/${edition?.book?.id}`,
      disabled: isLoading,
    },
    {
      name: t("edition.link.publisher"),
      path: `/publisher/${edition?.publisher?.id}`,
      disabled: isLoading,
    },
  ];

  return (
    <InfoPageTemplate
      hasImg={true}
      imgUrl={edition?.imgUrl}
      imgAlt={edition?.book?.name}
      links={links}
    >
      {isLoading && (
        <div className="flex items-center justify-center">
          <h1 className="text-3xl text-gray-500">
            {t("loader.edition.loading")}
          </h1>
        </div>
      )}
      {err && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl text-gray-500">
            {t("loader.edition.error")}
          </h1>
          <h3 className="text-xl text-red-400">
            [Code: {err.status}] {err.details.message}
          </h3>
        </div>
      )}
      {!isLoading && !error && (
        <>
          <InfoPageHeaderComponent
            headerTitle={t("edition.header")}
            title={edition?.book?.name}
            subtitle={`${edition?.serie?.name}  (#${edition?.book?.number}/${edition?.serie?.nvolumes})`}
            createdAt={edition?.createdAt}
            modifiedAt={edition?.modifiedAt}
            addedBy={edition?.addedBy?.username}
            links={links}
          />
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.ean")} :
            </h3>
            <p className="text-xl text-gray-200">{edition?.ean}</p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.isbn")} :
            </h3>
            <p className="text-xl text-gray-200">{edition?.isbn}</p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.publisher")} :
            </h3>
            <p className="text-xl text-gray-200">{edition?.publisher?.name}</p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.link")} :
            </h3>
            <a
              href={edition?.url}
              className="text-xl text-blue-400 hover:underline"
            >
              {edition?.book?.name}
            </a>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.coverType")} :
            </h3>
            <p className="text-xl text-gray-200">{edition?.coverType}</p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.parutionDate")} :
            </h3>
            <p className="text-xl text-gray-200">
              {edition?.parutionDate.toLocaleDateString(locale)}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.npages")} :
            </h3>
            <p className="text-xl text-gray-200">{edition?.npages} pages</p>
          </div>
          <div className="flex gap-2 items-center">
            <h3 className="text-xl text-gray-200 font-semibold">
              {t("edition.price")} :
            </h3>
            <p className="text-xl text-gray-200">
              {edition?.price.toPrecision(4)} €
            </p>
          </div>
        </>
      )}
    </InfoPageTemplate>
  );
}
