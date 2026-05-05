import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { Issue } from "~/models/issue";
import { toHtmlInputString, zDateOptional, zDateRequired } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import { TextRhfInput } from "./fields/TextRhfInput";
import { SearchSelectInput } from "./fields/SearchSelectInput";
import type { SimpleIssueSerie } from "~/models/issue-serie";
import { useState } from "react";
import { useLazySearchIssueSeriesByNameQuery } from "~/store/services/api";
import { DateRhfInput } from "./fields/DateRhfInput";

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
    name: z.string().min(1, t("issue.form.name.required")),
    number: z.coerce.number().min(1, t("issue.form.number.required")),
    coverDate: zDateRequired(t("form.required")),
    parutionDate: zDateRequired(t("form.required")),
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
    const newIssue: Partial<Issue> = {
      id: issue?.id,
      name: data.name,
      number: data.number,
      coverDate: data.coverDate,
      parutionDate: data.parutionDate,
      issueSerie: (issueSerieLocalRef ?? selectedIssueSerie) as SimpleIssueSerie,
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
    <form
      onSubmit={handleSubmit(triggerSubmission)}
      className="flex flex-col gap-6 p-6"
    >
      {/* Title */}
      <h2 className="text-lg font-semibold tracking-wide text-white/90 text-center border-b border-white/10 pb-4">
        {t("issue.form.title")}
      </h2>

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
          placeholder={t("issue.form.issueserieSearchPlaceholder")}
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
          label={t("book.number")}
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
        />
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
          onClick={noPropagationEvt()}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {issue ? t("issue.form.modify") : t("issue.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
