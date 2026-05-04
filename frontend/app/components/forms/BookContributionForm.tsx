import { useEffect, useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { Serie, SimpleSerie } from "~/models/serie";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import z, { date } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toHtmlInputString, zDateOptional, zDateRequired } from "~/utils/date";
import type { Book } from "~/models/book";
import { useLazySearchSeriesByNameQuery } from "~/store/services/api";
import { MdDelete } from "react-icons/md";

interface BookFormProps {
  book?: Book;
  serieLocalRef?: number;
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
  const schema = z.object({
    name: z.string().min(1, t("book.form.name.required")),
    desc: z.string().optional(),
    number: z.number().optional(),
    voContent: z.string().optional(),
    imgUrl: z.httpUrl().min(1, "book.form.img.required"),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors },
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
      serie: (!serieLocalRef
        ? selectedSerie
        : {
            id: serieLocalRef,
          }) as SimpleSerie,
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

    onSubmit && onSubmit(contrib);
  };

  // UX : show selected image preview to user
  const [newImgUrl, setNewImgUrl] = useState<string>(book?.imgUrl || "");

  // Searching for series
  const [searchValue, setSearchValue] = useState("");
  const [search, { data, isLoading }] = useLazySearchSeriesByNameQuery();

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(evt.target.value);
    const value = evt.target.value;
    search({ query: value });
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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-white/40">
          {t("book.name")}
        </label>
        <input
          {...register("name")}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {errors.name && (
          <p className="text-xs text-rose-400/80">{errors.name.message}</p>
        )}
      </div>

      {/* Serie selection */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="search"
          className="text-xs font-medium uppercase tracking-widest text-white/40"
        >
          {t("book.serie")}
        </label>

        {/* Selected badge — shown instead of input when a serie is picked */}
        {serieLocalRef || selectedSerie ? (
          <div className="flex items-center justify-between gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-md px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              {/* Checkmark */}
              <svg
                viewBox="0 0 10 10"
                className="w-3 h-3 shrink-0 text-indigo-400"
                fill="none"
              >
                <path
                  d="M1.5 5l2.5 2.5 4.5-4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* If the serie is actually a localref */}
              {serieLocalRef || (selectedSerie && selectedSerie.id < 0) ? (
                <>
                  <span className="text-xs text-indigo-300/60 flex items-center gap-1">
                    {t("book.form.localRefPresent")}
                  </span>
                </>
              ) : (
                // If is not a local ref
                selectedSerie && (
                  <>
                    <span className="text-indigo-300 font-medium">
                      {selectedSerie.name}
                    </span>
                    <span className="text-white/20 font-mono text-xs">
                      #{selectedSerie.id}
                    </span>
                  </>
                )
              )}
            </div>

            {/* If is not a local ref */}
            {!serieLocalRef && selectedSerie && selectedSerie.id >= 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSerie(undefined);
                  setSearchValue("");
                }}
                className="text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <MdDelete size={15} />
              </button>
            )}
          </div>
        ) : (
          <>
            <input
              type="text"
              id="search"
              name="search"
              value={searchValue}
              disabled={serieLocalRef !== undefined}
              placeholder={t("book.form.serieSearchPlaceholder")}
              onChange={handleSearch}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full disabled:opacity-30 disabled:cursor-not-allowed"
            />
            {data?.series && data.series.length > 0 && (
              <ol className="border border-white/10 rounded-md overflow-hidden">
                {data.series.map((ser) => (
                  <li
                    key={ser.id}
                    onClick={() => {
                      setSelectedSerie(ser);
                      setSearchValue("");
                    }}
                    className="px-3 py-2 text-sm text-white/70 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {ser.name}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>

      {/* Description field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="desc"
          className="text-xs font-medium uppercase tracking-widest text-white/40"
        >
          {t("cbundle.form.desc")}
        </label>
        <textarea
          {...register("desc")}
          rows={3}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none w-full"
        />
      </div>

      {/* VO Content field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="voContent"
          className="text-xs font-medium uppercase tracking-widest text-white/40"
        >
          {t("cbundle.form.voContent")}
        </label>
        <textarea
          {...register("voContent")}
          rows={3}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none w-full"
        />
      </div>

      {/* Image field */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("book.imgUrl")}
          </label>
          <input
            {...register("imgUrl", {
              onChange: (e) => setNewImgUrl(e.target.value),
            })}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
          {errors.imgUrl && (
            <p className="text-xs text-rose-400/80">{errors.imgUrl.message}</p>
          )}
        </div>
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
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40"
        >
          {book ? t("book.form.modify") : t("book.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
