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
import type { ContributionIssue, Issue } from "~/models/issue";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import { useLazySearchIssueSeriesByNameQuery } from "~/store/services/api";
import { toHtmlInputString, toYYYYmmDD, zDateRequired } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { DateRhfInput } from "../fields/DateRhfInput";
import { SearchSelectInput } from "../fields/SearchSelectInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { GenericForm } from "../GenericForm";

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

  // Validation schema
  const schema = z.object({
    name: z.string().min(1, t("generic.required", { capitalize: true })),
    number: z.coerce
      .number()
      .gte(0, t("issue.form.number.gte0"))
      .min(1, t("generic.required", { capitalize: true })),
    coverDate: zDateRequired(t("generic.required", { capitalize: true })),
    parutionDate: zDateRequired(t("generic.required", { capitalize: true })),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: issue?.name,
      number: issue?.number,
      // dates set manually
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newIssue: ContributionIssue = {
      id: issue?.id,
      name: data.name,
      number: data.number,
      coverDate: toYYYYmmDD(data.coverDate),
      parutionDate: toYYYYmmDD(data.parutionDate),
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
          registration={register("parutionDate", {
            valueAsDate: true,
          })}
          inputProps={{
            defaultValue: toHtmlInputString(issue?.parutionDate),
          }}
          error={errors.parutionDate}
          tooltip={t("issue.parutionDateExplanation")}
          className="max-w-50"
        />
        <DateRhfInput
          label={t("issue.coverDate")}
          registration={register("coverDate", {
            valueAsDate: true,
          })}
          inputProps={{
            defaultValue: toHtmlInputString(issue?.coverDate),
          }}
          error={errors.coverDate}
          tooltip={t("issue.coverDateExplanation")}
          className="max-w-50"
        />
      </div>
    </GenericForm>
  );
}
