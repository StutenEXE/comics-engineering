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
import { buildIssueShortName, type SimpleIssue } from "~/models/issue";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import type { SimpleSerie } from "~/models/serie";
import {
  useIssueSerieByIdQuery,
  useLazySearchIssueSeriesByNameQuery,
  useLazySearchSeriesByNameQuery,
} from "~/store/services/api";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../../buttons/GenericButton";
import { SearchSelectInput } from "../fields/SearchSelectInput";
import { TextAreaRhfInput } from "../fields/TextAreaRhfInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { GenericForm } from "../GenericForm";

interface BookFormProps {
  book?: Book;
  serieLocalRef?: { id: number; name: string };
  // Local issues available for linking inside the current bundle
  localIssues?: SimpleIssue[];
  // Local issue series available for search inside the current bundle
  localIssueSeries?: SimpleIssueSerie[];
  action: "create" | "update";
  onSubmit?: (c: Partial<SimpleContribution>) => void;
  onCancel?: () => void;
}

export function BookContributionForm({
  book,
  serieLocalRef,
  localIssues,
  localIssueSeries,
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
      issues: selectedLinkedIssues,
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

  // Searching for book series
  const [searchBookSeries, { data: bookSeriesResults }] =
    useLazySearchSeriesByNameQuery();
  const handleSearch = (query: string) => {
    searchBookSeries({ query: query });
  };

  const [selectedSerie, setSelectedSerie] = useState<SimpleSerie | undefined>(
    book?.serie ?? undefined,
  );

  const [issueSeriesQuery, setIssueSeriesQuery] = useState("");
  const [searchIssueSeries, { data: issueSeriesResults }] =
    useLazySearchIssueSeriesByNameQuery();
  const [selectedIssueSerie, setSelectedIssueSerie] = useState<
    SimpleIssueSerie | undefined
  >(undefined);
  const { data: selectedIssueSerieData } = useIssueSerieByIdQuery(
    { id: selectedIssueSerie?.id ?? 0 },
    { skip: !selectedIssueSerie || selectedIssueSerie.id < 0 },
  );

  const issueSerieIssues = selectedIssueSerieData?.issueSerie?.issues ?? [];

  const issueSeriesSearchResults = [
    ...(localIssueSeries ?? []).filter((serie) =>
      issueSeriesQuery
        ? serie.name.toLowerCase().includes(issueSeriesQuery.toLowerCase())
        : true,
    ),
    ...(issueSeriesResults?.issueSeries ?? []),
  ];

  // Selected linked issues from the book contribution
  const [selectedLinkedIssues, setSelectedLinkedIssues] = useState<
    SimpleIssue[]
  >((book as any)?.issues ?? []);

  const addLinkedIssue = (issue: SimpleIssue) => {
    setSelectedLinkedIssues((s) =>
      s.some((x) => x.id === issue.id && issue.id !== undefined)
        ? s
        : [...s, issue],
    );
    console.log("Added linked issue:", issue);
  };

  const removeLinked = (idx: number) => {
    setSelectedLinkedIssues((s) => s.filter((_, i) => i !== idx));
  };

  const localIssuesForSelectedSerie =
    localIssues?.filter((issue) => {
      if (!selectedIssueSerie) return false;
      if (
        selectedIssueSerie.id < 0 &&
        issue.issueSerieId === selectedIssueSerie.id
      ) {
        return true;
      }
      if (issue.issueSerieId && issue.issueSerieId === selectedIssueSerie.id)
        return true;
      if (
        issue.issueSerieName &&
        issue.issueSerieName === selectedIssueSerie.name
      )
        return true;
      return false;
    }) ?? [];

  return (
    <GenericForm
      title={action === "update" ? t("book.form.title.modify") : t("book.form.title.create")}
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={action === "update" ? t("book.form.modify") : t("book.form.create")}
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
          results={bookSeriesResults?.series}
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

      {/* Linked issues picker */}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-white/60">
            {t("book.form.linkedIssues")}
          </label>
          <span className="text-xs text-white/40">
            {t("book.form.linkedIssuesHint")}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_280px] mt-2">
          <div className="space-y-3">
            <SearchSelectInput
              label={t("book.form.issueSerie")}
              placeholder={t("book.form.issueSeriePlaceholder")}
              selectedItem={selectedIssueSerie}
              results={issueSeriesSearchResults}
              isLocalRefRemovable={true}
              onSearch={(query) => {
                setIssueSeriesQuery(query);
                searchIssueSeries({ query });
              }}
              onSelect={(serie) => {
                setSelectedIssueSerie(serie);
              }}
              onClear={() => setSelectedIssueSerie(undefined)}
              renderResult={(serie) => (
                <div>
                  <div className="font-medium text-white">{serie.name}</div>
                  {serie.id < 0 && (
                    <div className="text-xs text-white/40">
                      {t("generic.local")}
                    </div>
                  )}
                </div>
              )}
            />

            {selectedIssueSerie && (
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {selectedIssueSerie.name}
                    </div>
                    <div className="text-xs text-white/40">
                      {t("book.form.issueSerieIssues")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIssueSerie(undefined)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    {t("common.clear")}
                  </button>
                </div>

                <div className="space-y-2">
                  {issueSerieIssues.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-widest text-white/40">
                        {t("book.form.existingIssues")}
                      </div>
                      <div className="grid gap-2">
                        {issueSerieIssues.map((issue) => {
                          const linked = selectedLinkedIssues.some(
                            (li) => li.id === issue.id,
                          );
                          return (
                            <div
                              key={issue.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/10 px-3 py-2"
                            >
                              <div className="text-sm text-white/80">
                                {buildIssueShortName(issue)}
                              </div>
                              <GenericButton
                                type="button"
                                onClick={() =>
                                  addLinkedIssue({
                                    id: issue.id,
                                    name: buildIssueShortName(issue),
                                    number: issue.number,
                                    issueSerieId: selectedIssueSerie.id,
                                    issueSerieName: selectedIssueSerie.name,
                                    coverDate: issue.coverDate,
                                    parutionDate: issue.parutionDate,
                                  })
                                }
                                className="text-xs px-2 py-1"
                                disabled={linked}
                              >
                                {linked
                                  ? t("book.form.added")
                                  : t("book.form.add")}
                              </GenericButton>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-white/40">
                      {t("book.form.noIssuesInSerie")}
                    </div>
                  )}

                  {localIssuesForSelectedSerie.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-widest text-white/40">
                        {t("book.form.localIssues")}
                      </div>
                      <div className="grid gap-2">
                        {localIssuesForSelectedSerie.map((issue) => {
                          const linked = selectedLinkedIssues.some(
                            (li) => li.id === issue.id,
                          );
                          return (
                            <div
                              key={issue.id}
                              className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/10 px-3 py-2"
                            >
                              <div className="text-sm text-white/80">
                                {issue.name}
                              </div>
                              <GenericButton
                                type="button"
                                onClick={() => addLinkedIssue(issue)}
                                className="text-xs px-2 py-1"
                                disabled={linked}
                              >
                                {linked
                                  ? t("book.form.added")
                                  : t("book.form.add")}
                              </GenericButton>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-md border border-white/10 bg-white/5 p-3">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
              {t("book.form.linkedIssuesSelected")}
            </div>
            <div className="space-y-2">
              {selectedLinkedIssues.length === 0 ? (
                <div className="text-sm text-white/50">
                  {t("book.form.noLinkedIssues")}
                </div>
              ) : (
                selectedLinkedIssues.map((li, idx) => (
                  <div
                    key={`${li.id ?? li.id}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black/10 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium text-white">{li.name}</div>
                      <div className="text-xs text-white/50">
                        {li.issueSerieName ?? t("book.form.issueSerieUnknown")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLinked(idx)}
                      className="text-rose-400 text-xs"
                    >
                      {t("common.remove")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </GenericForm>
  );
}
