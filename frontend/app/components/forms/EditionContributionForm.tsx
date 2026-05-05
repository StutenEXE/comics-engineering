import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import { bookToSimpleBook, type SimpleBook } from "~/models/book";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { Edition } from "~/models/edition";
import {
  publisherToSimplePublisher,
  type SimplePublisher,
} from "~/models/publisher";
import {
  useLazySearchBooksByNameQuery,
  useLazySearchPublishersByNameQuery,
} from "~/store/services/api";
import { toHtmlInputString, zDateRequired } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import { DateRhfInput } from "./fields/DateRhfInput";
import { SearchSelectInput } from "./fields/SearchSelectInput";
import { SelectRhfInput } from "./fields/SelectRhfInput";
import { TextRhfInput } from "./fields/TextRhfInput";

interface EditionFormProps {
  edition?: Edition;
  bookLocalRef?: { id: number; name: string };
  action: "create" | "update";
  onSubmit?: (c: Partial<SimpleContribution>) => void;
  onCancel?: () => void;
}

export function EditionContributionForm({
  edition,
  bookLocalRef,
  action,
  onSubmit,
  onCancel,
}: EditionFormProps) {
  const { t } = useTranslation();

  // Validation schema
  const schema = z
    .object({
      isbn: z
        .string()
        .min(1, t("edition.form.isbn.required"))
        .regex(/^\d{13}$/, t("edition.form.isbn.13digits")),
      ean: z
        .string()
        .regex(/^\d{13}$/, t("edition.form.ean.13digits"))
        .optional()
        .or(z.literal("")),
      npages: z.coerce
        .number()
        .gte(0, t("edition.form.npages.gte0"))
        .optional(),
      price: z.coerce.number().gte(0, t("edition.form.price.gte0")).optional(),
      url: z.httpUrl().min(1, "edition.form.url.required"),
      imgUrl: z.httpUrl().min(1, "edition.form.img.required"),
      coverType: z.string(), //z.literal(["Hardcover", "Paperback", "Single issue"]),
      parutionDate: zDateRequired(t("form.required")),
    })
    .refine(() => bookLocalRef || selectedBook)
    .refine(() => selectedPublisher);

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      isbn: edition?.isbn,
      ean: edition?.ean,
      npages: edition?.npages,
      price: edition?.price,
      url: edition?.url,
      imgUrl: edition?.imgUrl,
      coverType: edition?.coverType,
      // dates set manually
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newEdition: Partial<Edition> = {
      id: edition?.id,
      isbn: data?.isbn,
      ean: data?.ean,
      npages: data?.npages,
      price: data?.price,
      url: data?.url,
      imgUrl: data?.imgUrl,
      coverType: data?.coverType,
      parutionDate: data?.parutionDate,
      book: (!bookLocalRef ? selectedBook : bookLocalRef) as SimpleBook,
      publisher: selectedPublisher,
    };
    const contrib: Partial<SimpleContribution> = {
      action:
        action === "create"
          ? ContributionActionEnum.CREATE
          : ContributionActionEnum.UPDATE,
      entityType: ContributionTypeEnum.EDITION,
      proposedData: newEdition,
      entityId: newEdition.id,
    };

    onSubmit?.(contrib);
  };

  // UX : show selected image preview to user
  const [newImgUrl, setNewImgUrl] = useState<string>(edition?.imgUrl || "");

  // Searching for books
  const [searchBook, { data: booksData }] = useLazySearchBooksByNameQuery();
  const handleBookSearch = (query: string) => {
    searchBook({ query: query });
  };
  const [selectedBook, setSelectedBook] = useState<SimpleBook | undefined>(
    edition?.book ?? undefined,
  );

  // Get all publishers
  const [searchPublisher, { data: pubsData }] =
    useLazySearchPublishersByNameQuery({});
  const handlePublisherSearch = (query: string) => {
    searchPublisher({ query: query });
  };
  const [selectedPublisher, setSelectedPublisher] = useState<
    SimplePublisher | undefined
  >(edition?.publisher ?? undefined);

  return (
    <form
      onSubmit={handleSubmit(triggerSubmission)}
      className="flex flex-col gap-6 p-6"
    >
      {/* Title */}
      <h2 className="text-lg font-semibold tracking-wide text-white/90 text-center border-b border-white/10 pb-4">
        {t("edition.form.title")}
      </h2>

      {/* Book selection */}
      <SearchSelectInput
        label={t("edition.book")}
        placeholder={t("edition.form.bookSearchPlaceholder")}
        localRefLabel={t("edition.form.localRefPresent")}
        selectedItem={selectedBook}
        localRef={bookLocalRef}
        results={booksData?.books.map(bookToSimpleBook)}
        onSearch={handleBookSearch}
        onSelect={setSelectedBook}
        onClear={() => setSelectedBook(undefined)}
        error={
          !isValid && !bookLocalRef && !selectedBook
            ? t("edition.form.book.required")
            : undefined
        }
      />

      {/* Publisher selection */}
      <SearchSelectInput
        label={t("edition.publisher")}
        placeholder={t("edition.form.publisherSearchPlaceholder")}
        selectedItem={selectedPublisher}
        results={pubsData?.publishers.map(publisherToSimplePublisher)}
        onSearch={handlePublisherSearch}
        onSelect={setSelectedPublisher}
        onClear={() => setSelectedPublisher(undefined)}
        error={
          !isValid && !selectedPublisher
            ? t("edition.form.publisher.required")
            : undefined
        }
      />

      {/* ISBN */}
      <div className="flex items-end gap-3">
        <TextRhfInput
          label={t("edition.isbn")}
          registration={register(
            "isbn",
            // {
            // onChange: (e) => {
            //   const raw = e.target.value.replace(/\D/g, ""); // Replace anything that is not a digit
            //   setIsbnDisplay(formatToIsbn(raw));
            // },}
          )}
          inputProps={{
            // maxLength: 17,
            maxLength: 13,
            inputMode: "numeric",
          }}
          error={errors.isbn}
        />
        <GenericButton disabled>{t("edition.form.autofill")}</GenericButton>
      </div>

      <div className="flex items-start gap-3">
        {/* EAN */}
        <TextRhfInput
          label={t("edition.ean")}
          registration={register("ean")}
          inputProps={{
            maxLength: 13,
            inputMode: "numeric",
          }}
          error={errors.ean}
        />

        {/* Parution date */}
        <DateRhfInput
          label={t("edition.parutionDate")}
          registration={register("parutionDate", {
            valueAsDate: true,
          })}
          inputProps={{
            defaultValue: toHtmlInputString(edition?.parutionDate),
          }}
          error={errors.parutionDate}
        />
      </div>

      <div className="flex items-start gap-3">
        {/* nPages */}
        <TextRhfInput
          label={t("edition.npages")}
          registration={register("npages")}
          inputProps={{
            type: "number",
            inputMode: "numeric",
          }}
          error={errors.npages}
        />
        {/* Price */}
        <TextRhfInput
          label={t("edition.price")}
          registration={register("price")}
          inputProps={{
            type: "number",
            inputMode: "numeric",
          }}
          error={errors.price}
        />
      </div>

      <div className="flex gap-3">
        {/* Url */}
        <TextRhfInput
          label={t("edition.url")}
          registration={register("url")}
          error={errors.url}
        />

        {/* CoverType*/}
        <SelectRhfInput
          label={t("edition.coverType")}
          options={[
            { label: t("edition.hardcover"), value: "hardcover" },
            { label: t("edition.paperback"), value: "paperback" },
            { label: t("edition.singleissue"), value: "singleissue" },
          ]}
          registration={register("coverType")}
        />
      </div>

      <div className="flex gap-3">
        <TextRhfInput
          label={t("edition.imgUrl")}
          registration={register("imgUrl", {
            onChange: (e) => setNewImgUrl(e.target.value),
          })}
          error={errors.imgUrl}
          className="w-[100%]"
        />
        {!errors.imgUrl && newImgUrl && (
          <img
            src={newImgUrl}
            alt={t("edition.form.altNewImage")}
            className="w-[100px]"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-2 border-t border-white/10">
        <GenericButton
          onClick={noPropagationEvt(onCancel)}
          className="flex-1 bg-white/5 border border-white/10 text-white/60 font-medium text-sm py-2 rounded-md hover:bg-white/10 hover:text-white/80 transition-all"
        >
          {t("generic.cancel", { capitalize: true })}
        </GenericButton>
        <GenericButton
          type="submit"
          // onClick={noPropagationEvt()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40 "
        >
          {edition ? t("edition.form.modify") : t("edition.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
