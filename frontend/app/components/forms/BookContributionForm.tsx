import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import type { Book } from "~/models/book";
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
      name: z.string().min(1, t("book.form.name.required")),
      desc: z.string().optional(),
      number: z.coerce.number().optional(),
      voContent: z.string().optional(),
      imgUrl: z.httpUrl().min(1, "book.form.img.required"),
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
    const newBook: Partial<Book> = {
      id: book?.id,
      name: data?.name,
      desc: data?.desc,
      voContent: data?.voContent,
      imgUrl: data?.imgUrl,
      serie: (!serieLocalRef ? selectedSerie : serieLocalRef) as SimpleSerie,
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
    <form
      onSubmit={handleSubmit(triggerSubmission)}
      className="flex flex-col gap-6 p-6"
    >
      {/* Title */}
      <h2 className="text-lg font-semibold tracking-wide text-white/90 text-center border-b border-white/10 pb-4">
        {t("book.form.title")}
      </h2>

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
          placeholder={t("book.form.serieSearchPlaceholder")}
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

        <TextRhfInput
          label={t("book.number")}
          registration={register("number")}
          inputProps={{ type: "number", inputMode: "numeric" }}
          error={errors.number}
          className="w-25"
        />
      </div>

      {/* Description field */}
      <TextAreaRhfInput
        label={t("book.desc")}
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
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {book ? t("book.form.modify") : t("book.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
