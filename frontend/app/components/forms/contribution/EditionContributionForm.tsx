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
import type { ContributionEdition, Edition } from "~/models/edition";
import {
  publisherToSimplePublisher,
  type SimplePublisher,
} from "~/models/publisher";
import {
  useLazySearchBooksByNameQuery,
  useLazySearchPublishersByNameQuery,
} from "~/store/services/api";
import { toHtmlInputString, toYYYYmmDD, zDateRequired } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { FormSection } from "../FormSection";
import { CoverPreview } from "../fields/CoverPreview";
import { DateRhfInput } from "../fields/DateRhfInput";
import { SearchSelectInput } from "../fields/SearchSelectInput";
import { SelectRhfInput } from "../fields/SelectRhfInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { GenericForm } from "../GenericForm";
import { TextRhfInputWithAction } from "../fields/TextRhfInputWithAction";
import { useLazyScrapeIsbnQuery } from "~/store/services/scrapers";
import { isntEmpty } from "~/utils/strings";
import { useToast } from "~/components/toast/Toast";
import { decimalValueAs } from "../fields/fieldStyles";

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
  const toast = useToast();

  // Validation schema
  const schema = z
    .object({
      isbn: z
        .string()
        .min(1, t("generic.required", { capitalize: true }))
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
      url: z
        .httpUrl(t("generic.invalidUrl"))
        .min(1, t("generic.required", { capitalize: true })),
      imgUrl: z
        .httpUrl(t("generic.invalidUrl"))
        .min(1, t("generic.required", { capitalize: true })),
      coverType: z
        .string({ error: t("edition.form.coverType.required") })
        .min(1, t("edition.form.coverType.required")), //z.literal(["Hardcover", "Paperback", "Single issue"]),
      parutionDate: zDateRequired(t("generic.required", { capitalize: true })),
      width: z.coerce.number().gte(0, t("edition.form.width.gte0")).optional(),
      height: z.coerce
        .number()
        .gte(0, t("edition.form.height.gte0"))
        .optional(),
      thickness: z.coerce
        .number()
        .gte(0, t("edition.form.thickness.gte0"))
        .optional(),
    })
    .refine(() => bookLocalRef || selectedBook)
    .refine(() => selectedPublisher);

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    setValue,
    watch,
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
      parutionDate: edition?.parutionDate,
      height: edition?.dimensions.height,
      width: edition?.dimensions.width,
      thickness: edition?.dimensions.thickness,
    },
  });

  // UX : show selected image preview to user
  const watchedImgUrl = watch("imgUrl");
  // UX : Copy paste isbns with dashes
  const [isbnDisplay, setIsbnDisplay] = useState<string>(edition?.isbn || "");
  const [eanDisplay, setEanDisplay] = useState<string>(edition?.ean || "");

  const triggerSubmission = (data: FieldValues) => {
    const newEdition: ContributionEdition = {
      id: edition?.id,
      isbn: data?.isbn,
      ean: data?.ean,
      npages: data?.npages,
      price: data?.price,
      url: data?.url,
      imgUrl: data?.imgUrl,
      coverType: data?.coverType,
      parutionDate: toYYYYmmDD(data?.parutionDate),
      dimensions: {
        height: data?.height,
        width: data?.width,
        thickness: data?.thickness,
      },
      book: bookLocalRef ?? {
        id: selectedBook?.id!,
        name: selectedBook?.name!,
      },
      publisher: { id: selectedPublisher?.id!, name: selectedPublisher?.name! },
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

  // Scraper used for autofill
  const [scrape, { isFetching: scraperLoading }] = useLazyScrapeIsbnQuery();
  const triggerScraping = async (isbn: string) => {
    if (errors.isbn?.message) return;
    try {
      const res = await scrape({ isbn });
      if (res.error) throw new Error();

      // Wrong data source
      if (res?.data?.resultType !== "isbn") {
        toast.info(t("form.autofill.wrongSource"));
        return;
      }
      const scraped = res.data.result.edition;

      // Fill form fields from scraped data
      if (isntEmpty(scraped.isbn13)) {
        setValue("isbn", scraped.isbn13, {
          shouldTouch: true,
          shouldValidate: true,
        });
        // Until the difference between EAN and ISBN is understood
        setValue("ean", scraped.isbn13, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (scraped.pageCount !== undefined) {
        setValue("npages", scraped.pageCount, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (scraped.dimensions !== undefined) {
        setValue("height", scraped.dimensions.height, {
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("width", scraped.dimensions.width, {
          shouldTouch: true,
          shouldValidate: true,
        });
        setValue("thickness", scraped.dimensions.thickness, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (scraped.pageCount !== undefined) {
        setValue("npages", scraped.pageCount, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (scraped.pageCount !== undefined) {
        setValue("npages", scraped.pageCount, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (isntEmpty(scraped.publishDate)) {
        setValue("parutionDate", scraped.publishDate, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (isntEmpty(scraped.cover)) {
        setValue("imgUrl", scraped.cover, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    } catch (e) {
      toast.error(t("form.autofill.sourceNotFound"));
    }
  };

  return (
    <GenericForm
      title={
        action === "update"
          ? t("edition.form.title.modify")
          : t("edition.form.title.create")
      }
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={
        action === "update"
          ? t("edition.form.modify")
          : t("edition.form.create")
      }
      onSubmit={handleSubmit(triggerSubmission)}
      showRequiredHint
      size="lg"
    >
      <FormSection title={t("form.section.identification")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-4">
          {/* Book selection */}
          <SearchSelectInput
            label={t("edition.book")}
            required
            placeholder={t("generic.search.placeholder")}
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
            required
            placeholder={t("generic.search.placeholder")}
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
          <TextRhfInputWithAction
            inputLabel={t("edition.isbn")}
            required
            registration={register("isbn", {
              onChange: (e) => {
                const raw = e.target.value.replace(/\D/g, ""); // Replace anything that is not a digit
                setIsbnDisplay(raw);
              },
            })}
            inputProps={{
              value: isbnDisplay,
              inputMode: "numeric",
            }}
            buttonLabel={t("form.autofill")}
            buttonOnClick={triggerScraping}
            isLoading={scraperLoading}
            error={errors.isbn}
          />

          {/* EAN */}
          <TextRhfInput
            label={t("edition.ean")}
            registration={register("ean", {
              // Until the specific rule of EANs displays isn't understood, we use the same logic as for ISBNs
              onChange: (e) => {
                const raw = e.target.value.replace(/\D/g, ""); // Replace anything that is not a digit
                setEanDisplay(raw);
              },
            })}
            inputProps={{
              value: eanDisplay,
              inputMode: "numeric",
            }}
            error={errors.ean}
          />
        </div>
      </FormSection>

      <FormSection title={t("form.section.details")}>
        <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4">
          {/* Parution date */}
          <DateRhfInput
            label={t("edition.parutionDate")}
            required
            registration={register("parutionDate")}
            error={errors.parutionDate}
          />
          {/* nPages */}
          <TextRhfInput
            label={t("edition.npages")}
            registration={register("npages", { setValueAs: decimalValueAs })}
            inputProps={{ inputMode: "numeric" }}
            error={errors.npages}
          />
          {/* Price */}
          <TextRhfInput
            label={t("edition.price")}
            registration={register("price", { setValueAs: decimalValueAs })}
            inputProps={{ inputMode: "decimal" }}
            error={errors.price}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] items-start gap-4">
          {/* Url */}
          <TextRhfInput
            label={t("edition.url")}
            required
            registration={register("url")}
            error={errors.url}
          />

          {/* CoverType*/}
          <SelectRhfInput
            label={t("edition.coverType")}
            required
            defaultVal={edition?.coverType}
            options={[
              { label: t("edition.coverType.hardcover"), value: "hardcover" },
              { label: t("edition.coverType.paperback"), value: "paperback" },
              { label: t("edition.coverType.singleissue"), value: "singleissue" },
            ]}
            registration={register("coverType")}
            error={errors.coverType}
          />
        </div>
      </FormSection>

      <FormSection title={t("edition.dimensions")}>
        <div className="grid grid-cols-3 items-start gap-4">
          {/* Height */}
          <TextRhfInput
            label={t("edition.dimensions.height")}
            registration={register("height", { setValueAs: decimalValueAs })}
            inputProps={{ inputMode: "decimal" }}
            error={errors.height}
          />
          {/* Width */}
          <TextRhfInput
            label={t("edition.dimensions.width")}
            registration={register("width", { setValueAs: decimalValueAs })}
            inputProps={{ inputMode: "decimal" }}
            error={errors.width}
          />
          {/* Thickness */}
          <TextRhfInput
            label={t("edition.dimensions.thickness")}
            registration={register("thickness", { setValueAs: decimalValueAs })}
            inputProps={{ inputMode: "decimal" }}
            error={errors.thickness}
          />
        </div>
      </FormSection>

      <FormSection title={t("form.section.cover")}>
        <div className="flex items-start gap-4">
          <TextRhfInput
            label={t("edition.imgUrl")}
            required
            registration={register("imgUrl")}
            error={errors.imgUrl}
            className="flex-1"
          />
          <CoverPreview
            src={!errors.imgUrl ? watchedImgUrl : undefined}
            alt={t("edition.form.altNewImage")}
          />
        </div>
      </FormSection>
    </GenericForm>
  );
}
