import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef, useEffect } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { ContributionIssue, Issue } from "~/models/issue";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import { useLazySearchIssueSeriesByNameQuery } from "~/store/services/api";
import { useLazyScrapeUrlQuery } from "~/store/services/scrapers";
import { toHtmlInputString, toYYYYmmDD, zDateRequired } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { isntEmpty } from "~/utils/strings";
import { DateRhfInput } from "../fields/DateRhfInput";
import { SearchSelectInput } from "../fields/SearchSelectInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { TextRhfInputWithAction } from "../fields/TextRhfInputWithAction";
import { GenericForm } from "../GenericForm";
import { useToast } from "~/components/toast/Toast";

interface IssueFormProps {
  issue?: Issue;
  issueSerieLocalRef?: { id: number; name: string };
  action: "create" | "update";
  onSubmit?: (c: Partial<SimpleContribution>) => void;
  onCancel?: () => void;
}

export function IssueContributionForm({
  issue,
  issueSerieLocalRef,
  action,
  onSubmit,
  onCancel,
}: IssueFormProps) {
  const { t } = useTranslation();
  const toast = useToast();

  // Validation schema
  const schema = z
    .object({
      fandomUrl: z.url().optional(),
      name: z.string().min(1, t("generic.required", { capitalize: true })),
      number: z.coerce
        .number()
        .gte(0, t("issue.form.number.gte0"))
        .min(0, t("generic.required", { capitalize: true })),
      coverDate: zDateRequired(t("generic.required", { capitalize: true })),
      parutionDate: zDateRequired(t("generic.required", { capitalize: true })),
    })
    .refine(() => issueSerieLocalRef || selectedIssueSerie);

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fandomUrl: issue?.fandomUrl,
      name: issue?.name,
      number: issue?.number,
      parutionDate: issue?.parutionDate,
      coverDate: issue?.coverDate,
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newIssue: ContributionIssue = {
      id: issue?.id,
      name: data.name,
      number: data.number,
      coverDate: data.coverDate,
      parutionDate: data.parutionDate,
      fandomUrl: data.fandomUrl,
      issueSerie: issueSerieLocalRef ?? {
        id: selectedIssueSerie?.id!,
        name: selectedIssueSerie?.name!,
      },
    };
    const contrib: Partial<SimpleContribution> = {
      action:
        action === "create"
          ? ContributionActionEnum.CREATE
          : ContributionActionEnum.UPDATE,
      entityType: ContributionTypeEnum.ISSUE,
      proposedData: newIssue,
      entityId: newIssue.id,
    };

    onSubmit?.(contrib);
  };

  // Searching for issue series
  const [search, { data }] = useLazySearchIssueSeriesByNameQuery();
  const handleSearch = (query: string) => {
    search({ query: query });
  };

  const [selectedIssueSerie, setSelectedIssueSerie] = useState<
    SimpleIssueSerie | undefined
  >(issue?.issueSerie ?? undefined);

  // Scraper used for autofill
  const [scrape, { isFetching: scraperLoading }] = useLazyScrapeUrlQuery();
  const triggerScraping = async (url: string) => {
    if (errors.fandomUrl?.message) return;
    try {
      const res = await scrape({ url });
      if (res.error) throw new Error();

      // Wrong data source
      if (res?.data?.resultType !== "issue") {
        toast.info(t("form.autofill.wrongSource"));
        return;
      }
      const scraped = res.data.result;

      // Fill form fields from scraped data
      if (isntEmpty(scraped.name)) {
        setValue("name", scraped.name, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (scraped.number !== undefined) {
        setValue("number", scraped.number, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      if (isntEmpty(scraped.parutionDate))
        setValue("parutionDate", toHtmlInputString(scraped.parutionDate), {
          shouldTouch: true,
          shouldValidate: true,
        });
      if (isntEmpty(scraped.coverDate))
        setValue("coverDate", toHtmlInputString(scraped.coverDate), {
          shouldTouch: true,
          shouldValidate: true,
        });
    } catch (e) {
      toast.error(t("form.autofill.sourceNotFound"));
    }
  };

  // Ref ensures we only scrape once
  const scrapedOnceRef = useRef(false);
  useEffect(() => {
    if (scrapedOnceRef.current) return;
    scrapedOnceRef.current = true;
    // If some data is already present (e.g name), do not auto scrape
    if (isntEmpty(issue?.name)) return;
    // If issue has no real id and a fandom url, scrape fandom once when component mounts or when fandomUrl changes
    if ((!issue?.id || issue?.id < 0) && isntEmpty(issue?.fandomUrl)) {
      triggerScraping(issue.fandomUrl);
    }
  }, [issue?.id, issue?.fandomUrl]);

  return (
    <GenericForm
      title={
        action === "update"
          ? t("issue.form.title.modify")
          : t("issue.form.title.create")
      }
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={
        action === "update" ? t("issue.form.modify") : t("issue.form.create")
      }
      onSubmit={handleSubmit(triggerSubmission)}
    >
      {/* Fandom Url field */}
      <TextRhfInputWithAction
        inputLabel={t("issue.fandomUrl")}
        registration={register("fandomUrl")}
        buttonLabel={t("form.autofill")}
        buttonOnClick={(val) => triggerScraping(val)}
        isLoading={scraperLoading}
        error={errors.fandomUrl}
      />

      {/* Name field */}
      <TextRhfInput
        label={t("issue.name")}
        registration={register("name")}
        error={errors.name}
      />

      <div className="flex items-start gap-3">
        {/* IssueSerie selection */}
        <SearchSelectInput
          label={t("issue.serie")}
          placeholder={t("generic.search.placeholder")}
          localRefLabel={t("issue.form.localRefPresent")}
          selectedItem={selectedIssueSerie}
          localRef={issueSerieLocalRef}
          results={data?.issueSeries}
          onSearch={handleSearch}
          onSelect={setSelectedIssueSerie}
          onClear={() => setSelectedIssueSerie(undefined)}
          error={
            !isValid && !issueSerieLocalRef && !selectedIssueSerie
              ? t("issue.form.issueserie.required")
              : undefined
          }
        />

        <TextRhfInput
          label={t("issue.number")}
          registration={register("number")}
          inputProps={{ type: "number", inputMode: "numeric" }}
          error={errors.number}
          className="w-25"
        />
      </div>

      <div className="flex items-center gap-3">
        <DateRhfInput
          label={t("issue.parutionDate")}
          registration={register("parutionDate")}
          error={errors.parutionDate}
          tooltip={t("issue.parutionDateExplanation")}
          className="max-w-50"
        />
        <DateRhfInput
          label={t("issue.coverDate")}
          registration={register("coverDate")}
          error={errors.coverDate}
          tooltip={t("issue.coverDateExplanation")}
          className="max-w-50"
        />
      </div>
    </GenericForm>
  );
}
