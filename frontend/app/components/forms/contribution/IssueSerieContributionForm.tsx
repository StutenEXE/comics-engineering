import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { ContributionIssueSerie, IssueSerie } from "~/models/issue-serie";
import {
  toHtmlInputString,
  toYYYYmmDD,
  zDateOptional,
  zDateRequired,
} from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { DateRangeRhfInput } from "../fields/DateRangeRhfInput";
import { TextAreaRhfInput } from "../fields/TextAreaRhfInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { GenericForm } from "../GenericForm";
import { TextRhfInputWithAction } from "../fields/TextRhfInputWithAction";
import { useLazyScrapeUrlQuery } from "~/store/services/scrapers";
import { isntEmpty } from "~/utils/strings";
import { useToast } from "~/components/toast/Toast";

interface IssueSerieFormProps {
  issueSerie?: IssueSerie;
  action: "create" | "update";
  onSubmit?: (c: Partial<SimpleContribution>) => void;
  onCancel?: () => void;
}

export function IssueSerieContributionForm({
  issueSerie,
  action,
  onSubmit,
  onCancel,
}: IssueSerieFormProps) {
  const { t } = useTranslation();
  const toast = useToast();

  // Validation schema
  const schema = z
    .object({
      fandomUrl: z.url().optional(),
      name: z.string().min(1, t("generic.required", { capitalize: true })),
      desc: z.string().optional(),
      startDate: zDateRequired(t("generic.required", { capitalize: true })),
      endDate: zDateOptional(),
    })
    .refine(
      (data) => {
        if (!data.endDate) return true;
        return data.endDate >= data.startDate;
      },
      { message: t("issueserie.form.endDate.afterStart"), path: ["endDate"] },
    );

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      fandomUrl: issueSerie?.fandomUrl,
      name: issueSerie?.name,
      desc: issueSerie?.desc,
      startDate: issueSerie?.startDate,
      endDate: issueSerie?.endDate
    },
  });
  
  // Watchers are here to format the date properly in the input
  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");

  const triggerSubmission = (data: FieldValues) => {
    const newIssueSerie: ContributionIssueSerie = {
      id: issueSerie?.id,
      name: data.name,
      desc: data.desc,
      startDate: toYYYYmmDD(data.startDate),
      endDate: toYYYYmmDD(data.endDate),
      fandomUrl: data.fandomUrl,
    };
    const contrib: Partial<SimpleContribution> = {
      action:
        action === "create"
          ? ContributionActionEnum.CREATE
          : ContributionActionEnum.UPDATE,
      entityType: ContributionTypeEnum.ISSUE_SERIE,
      proposedData: newIssueSerie,
      entityId: newIssueSerie.id,
    };

    onSubmit?.(contrib);
  };

  // Handle specific UX case : endDate always after startDate
  const [endDateDisabled, setEndDateDisabled] = useState(
    issueSerie === undefined,
  );
  const [minEndDate, setMinEndDate] = useState(
    toHtmlInputString(issueSerie?.startDate),
  );

  const onStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDateDisabled(!val);
    if (val) {
      setMinEndDate(val);
    }
  };

  // Scraper used for autofill
  const [scrape, { isFetching: scraperLoading }] = useLazyScrapeUrlQuery();
  const triggerScraping = async (url: string) => {
    if (errors.fandomUrl?.message) return;
    try {
      const res = await scrape({ url });
      if (res.error) throw new Error()
      
      // Wrong data source
      if (res?.data?.resultType !== "issueserie") {
        toast.info(t("form.autofill.wrongSource"))
        return
      };
      const scraped = res.data.result;

      // Fill form fields from scraped data
      if (isntEmpty(scraped.name)) {
        setValue("name", scraped.name, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }

      if (scraped.description) {
        setValue("desc", scraped.description, {
          shouldTouch: true,
          shouldValidate: true,
        });
      }

      if (isntEmpty(scraped.startDate)) {
        const startDate = new Date(scraped.startDate);
        setValue("startDate", new Date(scraped.startDate), {
          shouldTouch: true,
          shouldValidate: true,
        });
        setEndDateDisabled(false);
        setMinEndDate(toHtmlInputString(startDate));
      }

      if (isntEmpty(scraped.endDate)) {
        setValue("endDate", new Date(scraped.endDate), {
          shouldTouch: true,
          shouldValidate: true
        });
      }
    } catch (e) {
      toast.error(t("form.autofill.sourceNotFound"))
    }
  };


  return (
    <GenericForm
      title={
        action === "update"
          ? t("issueserie.form.title.modify")
          : t("issueserie.form.title.create")
      }
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={
        action === "update" ? t("issueserie.form.modify") : t("issueserie.form.create")
      }
      onSubmit={handleSubmit(triggerSubmission)}
    >
      {/* Fandom Url field */}
      <TextRhfInputWithAction
        inputLabel={t("issueserie.fandomUrl")}
        registration={register("fandomUrl")}
        buttonLabel={t("form.autofill")}
        buttonOnClick={(val) => triggerScraping(val)}
        isLoading={scraperLoading}
        error={errors.fandomUrl}
      />

      {/* Name field */}
      <TextRhfInput
        label={t("issueserie.name")}
        registration={register("name")}
        error={errors.name}
      />

      {/* Date range */}
      <DateRangeRhfInput
        startProps={{
          label: t("issueserie.startDate"),
          registration: register("startDate", {
            onChange: onStartDateChange,
            valueAsDate: true,
          }),
          inputProps: {
            value: toHtmlInputString(watchedStartDate)
          },
          error: errors.startDate,
        }}
        endProps={{
          label: t("issueserie.endDate"),
          registration: register("endDate", {
            valueAsDate: true,
          }),
          inputProps: {
            disabled: endDateDisabled,
            min: minEndDate,
            value: toHtmlInputString(watchedEndDate) 
          },
          error: errors.endDate,
        }}
      />

      {/* Description field */}
      <TextAreaRhfInput
        label={t("issueserie.description")}
        registration={register("desc")}
        inputProps={{
          rows: 6
        }}
        className="min-w-200"
        error={errors.desc}
      />
    </GenericForm>
  );
}
