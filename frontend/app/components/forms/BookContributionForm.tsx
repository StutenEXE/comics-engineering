import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import type { Book, ContributionBook } from "~/models/book";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { SimpleSerie } from "~/models/serie";
import { useLazySearchSeriesByNameQuery } from "~/store/services/api";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import { SearchSelectInput } from "./fields/SearchSelectInput";
import { TextAreaRhfInput } from "./fields/TextAreaRhfInput";
import { TextRhfInput } from "./fields/TextRhfInput";
import { GenericForm } from "./GenericForm";

interface BookFormProps {
  book?: Book;
  serieLocalRef?: { id: number; name: string };
  action: "create" | "update";
  onSubmit?: (c: Partial<SimpleContribution>) => void;
  onCancel?: () => void;
}

export function BookContributionForm({
  book,
  serieLocalRef,
  action,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const { t } = useTranslation();

  // Validation schema
  const schema = z
    .object({
      name: z.string().min(1, t("generic.required", { capitalize: true })),
      desc: z.string().optional(),
      number: z.coerce.number().gte(0, t("book.form.number.gte0")).optional(),
      voContent: z.string().optional(),
      imgUrl: z
        .httpUrl(t("generic.invalidUrl"))
        .min(1, t("generic.required", { capitalize: true })),
    })
    .refine(() => serieLocalRef || selectedSerie);

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: book?.name,
      desc: book?.desc,
      number: book?.number,
      voContent: book?.voContent,
      imgUrl: book?.imgUrl,
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newBook: ContributionBook = {
      id: book?.id,
      name: data?.name,
      desc: data?.desc,
      number: data?.number,
      voContent: data?.voContent,
      imgUrl: data?.imgUrl,
      serie: serieLocalRef ?? {
        id: selectedSerie?.id!,
        name: selectedSerie?.name!,
      },
    };
    const contrib: Partial<SimpleContribution> = {
      action:
        action === "create"
          ? ContributionActionEnum.CREATE
          : ContributionActionEnum.UPDATE,
      entityType: ContributionTypeEnum.BOOK,
      proposedData: newBook,
      entityId: newBook.id,
    };

    onSubmit?.(contrib);
  };

  // UX : show selected image preview to user
  const [newImgUrl, setNewImgUrl] = useState<string>(book?.imgUrl || "");

  // Searching for series
  const [search, { data }] = useLazySearchSeriesByNameQuery();
  const handleSearch = (query: string) => {
    search({ query: query });
  };

  const [selectedSerie, setSelectedSerie] = useState<SimpleSerie | undefined>(
    book?.serie ?? undefined,
  );

  return (
    <GenericForm
      title={book ? t("book.form.title.modify") : t("book.form.title.create")}
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={book ? t("book.form.modify") : t("book.form.create")}
      onSubmit={handleSubmit(triggerSubmission)}
    >
      {/* Name field */}
      <TextRhfInput
        label={t("book.name")}
        registration={register("name")}
        error={errors.name}
      />

      <div className="flex items-start gap-3">
        {/* Serie selection */}
        <SearchSelectInput
          label={t("book.serie")}
          placeholder={t("generic.search.placeholder")}
          localRefLabel={t("book.form.localRefPresent")}
          selectedItem={selectedSerie}
          localRef={serieLocalRef}
          results={data?.series}
          onSearch={handleSearch}
          onSelect={setSelectedSerie}
          onClear={() => setSelectedSerie(undefined)}
          error={
            !isValid && !serieLocalRef && !selectedSerie
              ? t("book.form.serie.required")
              : undefined
          }
        />

        {/* Number */}
        <TextRhfInput
          label={t("book.number")}
          registration={register("number")}
          inputProps={{ type: "number", inputMode: "numeric", min: 0 }}
          error={errors.number}
          className="w-25"
        />
      </div>

      {/* Description field */}
      <TextAreaRhfInput
        label={t("book.description")}
        registration={register("desc")}
        error={errors.desc}
      />

      {/* VO Content field */}
      <TextAreaRhfInput
        label={t("book.voContent")}
        registration={register("voContent")}
        error={errors.voContent}
      />

      {/* Image field */}
      <div className="flex gap-3">
        <TextRhfInput
          label={t("book.imgUrl")}
          registration={register("imgUrl", {
            onChange: (e) => setNewImgUrl(e.target.value),
          })}
          error={errors.imgUrl}
          className="w-[100%]"
        />
        {!errors.imgUrl && newImgUrl && (
          <img
            src={newImgUrl}
            alt={t("book.form.altNewImage")}
            className="w-[100px]"
          />
        )}
      </div>
    </GenericForm>
  );
}
