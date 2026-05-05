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
import type { Serie } from "~/models/serie";
import { toHtmlInputString, zDateOptional, zDateRequired } from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import { CheckboxRhfInput } from "./fields/CheckboxRhfInput";
import { DateRangeRhfInput } from "./fields/DateRangeRhfInput";
import { TextRhfInput } from "./fields/TextRhfInput";
import type { IssueSerie } from "~/models/issue-serie";
import { TextAreaRhfInput } from "./fields/TextAreaRhfInput";

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

  // Validation schema
  const schema = z
    .object({
      name: z.string().min(1, t("issueserie.form.name.required")),
      desc: z.string().optional(),
      startDate: zDateRequired(t("form.required")),
      endDate: zDateOptional(),
    })
    .refine(
      (data) => {
        if (!data.endDate) return true;
        return data.endDate > data.startDate;
      },
      { message: t("serie.form.endDate.afterStart"), path: ["endDate"] },
    );

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: issueSerie?.name,
      desc: issueSerie?.desc
      // dates set manually
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newIssueSerie: Partial<IssueSerie> = {
      id: issueSerie?.id,
      name: data.name,
      desc: data.desc,
      startDate: data.startDate,
      endDate: data.endDate,
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

  return (
    <form
      onSubmit={handleSubmit(triggerSubmission)}
      className="flex flex-col gap-6 p-6"
    >
      {/* Title */}
      <h2 className="text-lg font-semibold tracking-wide text-white/90 text-center border-b border-white/10 pb-4">
        {t("serie.form.title")}
      </h2>

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
            defaultValue: toHtmlInputString(issueSerie?.startDate),
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
            defaultValue: issueSerie?.endDate
              ? toHtmlInputString(issueSerie?.endDate)
              : undefined,
          },
          error: errors.startDate,
        }}
      />

      {/* Description field */}
      <TextAreaRhfInput
        label={t("issueserie.desc")}
        registration={register("desc")}
        error={errors.desc}
      />

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
          {issueSerie
            ? t("issueserie.form.modify")
            : t("issueserie.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
