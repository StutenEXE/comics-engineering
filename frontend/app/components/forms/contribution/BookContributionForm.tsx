import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import type {
  Book,
  ContributionBook,
  SimpleIssueStringDates,
} from "~/models/book";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import { type ContributionIssue, type SimpleIssue } from "~/models/issue";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import type { SimpleSerie } from "~/models/serie";
import {
  useIssueSerieByIdQuery,
  useLazySearchIssueSeriesByNameQuery,
  useLazySearchSeriesByNameQuery,
} from "~/store/services/api";
import { toYYYYmmDD } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { SearchSelectInput } from "../fields/SearchSelectInput";
import { TextAreaRhfInput } from "../fields/TextAreaRhfInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { GenericForm } from "../GenericForm";
import { useLazyScrapeIsbnQuery } from "~/store/services/scrapers";
import { TextRhfInputWithAction } from "../fields/TextRhfInputWithAction";
import { isntEmpty } from "~/utils/strings";
import { useToast } from "~/components/toast/Toast";
import { MdClose } from "react-icons/md";
import { FormSection } from "../FormSection";
import { CoverPreview } from "../fields/CoverPreview";
import { fieldInputClass } from "../fields/fieldStyles";

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
  const toast = useToast();

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
    setValue,
    watch,
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

  // UX : show selected image preview to user
  const watchedImgUrl = watch("imgUrl");

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
      issues: selectedLinkedIssues.map((issue) => {
        const issueCopy: SimpleIssueStringDates = {
          id: issue.id,
          name: issue.name,
          number: issue.number,
          coverDate: toYYYYmmDD(issue.coverDate),
          parutionDate: toYYYYmmDD(issue.parutionDate),
          issueSerieId: issue.issueSerieId,
          issueSerieName: issue.issueSerieName,
        };
        return issueCopy;
      }),
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

  const [issueNumberQuery, setIssueNumberQuery] = useState("");

  const availableIssuesForSelectedSerie = [
    ...issueSerieIssues,
    ...localIssuesForSelectedSerie,
  ].reduce<SimpleIssue[]>((acc, issue) => {
    if (!acc.some((item) => item.id === issue.id)) {
      acc.push(issue);
    }
    return acc;
  }, []);

  const filteredAvailableIssues = issueNumberQuery
    ? availableIssuesForSelectedSerie.filter((issue) =>
        issue.number?.toString().includes(issueNumberQuery),
      )
    : availableIssuesForSelectedSerie;

  const selectedIssuesBySerie = selectedLinkedIssues.reduce<
    Record<string, SimpleIssue[]>
  >((acc, issue) => {
    const serieLabel =
      issue.issueSerieName ?? `${issue.issueSerieId ?? "unknown"}`;
    if (!acc[serieLabel]) acc[serieLabel] = [];
    acc[serieLabel].push(issue);
    return acc;
  }, {});

  // Scraper used for autofill
  const [scrape, { isFetching: scraperLoading }] = useLazyScrapeIsbnQuery();
  const triggerScraping = async (isbn: string) => {
    try {
      const res = await scrape({ isbn });
      if (res.error) throw new Error();

      // Wrong data source
      if (res?.data?.resultType !== "isbn") {
        toast.info(t("form.autofill.wrongSource"));
        return;
      }
      const scraped = res.data.result.book;

      // Fill form fields from scraped data
      if (isntEmpty(scraped.title)) {
        setValue("name", scraped.title, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (isntEmpty(scraped.description)) {
        setValue("desc", scraped.description, {
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
          ? t("book.form.title.modify")
          : t("book.form.title.create")
      }
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={
        action === "update" ? t("book.form.modify") : t("book.form.create")
      }
      onSubmit={handleSubmit(triggerSubmission)}
      size="lg"
    >
      <FormSection title={t("form.section.general")}>
        {/* ISBN for autofill */}
        <TextRhfInputWithAction
          inputLabel={t("book.form.isbnautofill")}
          buttonLabel={t("form.autofill")}
          buttonOnClick={triggerScraping}
          isLoading={scraperLoading}
        />

        {/* Name field */}
        <TextRhfInput
          label={t("book.name")}
          registration={register("name")}
          error={errors.name}
        />

        <div className="grid grid-cols-[1fr_6rem] items-start gap-4">
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
          />
        </div>
      </FormSection>

      <FormSection title={t("form.section.content")}>
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
      </FormSection>

      <FormSection title={t("form.section.cover")}>
        <div className="flex items-start gap-4">
          <TextRhfInput
            label={t("book.imgUrl")}
            registration={register("imgUrl")}
            error={errors.imgUrl}
            className="flex-1"
          />
          <CoverPreview
            src={!errors.imgUrl ? watchedImgUrl : undefined}
            alt={t("book.form.altNewImage")}
          />
        </div>
      </FormSection>

      {/* Linked issues picker */}
      <FormSection
        title={t("book.form.linkedIssues")}
        description={t("book.form.linkedIssuesHint")}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_16rem] items-start gap-4">
          <div className="flex flex-col gap-3 min-w-0">
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
                  <div className="font-medium text-zinc-100">{serie.name}</div>
                  {serie.id < 0 && (
                    <div className="text-xs text-zinc-500">
                      {t("generic.local")}
                    </div>
                  )}
                </div>
              )}
            />

            {selectedIssueSerie && (
              <div className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                <input
                  type="number"
                  placeholder={t("book.form.issueNumberSearch")}
                  value={issueNumberQuery}
                  onChange={(e) => setIssueNumberQuery(e.target.value)}
                  className={fieldInputClass}
                />

                {filteredAvailableIssues.length > 0 ? (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2">
                    {filteredAvailableIssues
                      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
                      .map((issue) => {
                        const linked = selectedLinkedIssues.some(
                          (li) => li.id === issue.id,
                        );
                        return (
                          <button
                            type="button"
                            key={issue.id}
                            onClick={() => addLinkedIssue(issue)}
                            disabled={linked}
                            className={`h-8 rounded-md border text-sm transition-colors ${
                              linked
                                ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200 cursor-not-allowed"
                                : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500 cursor-pointer"
                            }`}
                          >
                            #{issue.number}
                          </button>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    {t("book.form.noIssuesInSerie")}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
            <span className="text-sm font-medium text-zinc-300">
              {t("book.form.linkedIssuesSelected")}
              {selectedLinkedIssues.length > 0 && (
                <span className="ml-1.5 text-zinc-500">
                  ({selectedLinkedIssues.length})
                </span>
              )}
            </span>
            {selectedLinkedIssues.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {t("book.form.noLinkedIssues")}
              </p>
            ) : (
              Object.entries(selectedIssuesBySerie).map(
                ([serieLabel, issues]) => (
                  <div key={serieLabel} className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-400">{serieLabel}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {issues
                        .sort((a, b) => a.number - b.number)
                        .map((issue) => (
                          <span
                            key={issue.id}
                            className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 pl-2 pr-1 py-0.5 text-sm text-zinc-200"
                          >
                            #{issue.number ?? issue.name}
                            <button
                              type="button"
                              onClick={() =>
                                removeLinked(
                                  selectedLinkedIssues.findIndex(
                                    (li) => li.id === issue.id,
                                  ),
                                )
                              }
                              className="rounded p-0.5 text-zinc-500 hover:text-rose-400 cursor-pointer"
                              aria-label={t("generic.remove")}
                            >
                              <MdClose size={14} />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </FormSection>
    </GenericForm>
  );
}
