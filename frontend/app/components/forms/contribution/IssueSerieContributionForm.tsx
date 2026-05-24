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
      name: z.string().min(1, t("generic.required", { capitalize: true })),
      desc: z.string().optional(),
      startDate: zDateRequired(t("generic.required", { capitalize: true })),
      endDate: zDateOptional(),
    })
    .refine(
      (data) => {
        if (!data.endDate) return true;
        return data.endDate > data.startDate;
      },
      { message: t("issueserie.form.endDate.afterStart"), path: ["endDate"] },
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
      desc: issueSerie?.desc,
      // dates set manually
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newIssueSerie: ContributionIssueSerie = {
      id: issueSerie?.id,
      name: data.name,
      desc: data.desc,
      startDate: toYYYYmmDD(data.startDate),
      endDate: toYYYYmmDD(data.endDate),
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
        label={t("issueserie.description")}
        registration={register("desc")}
        error={errors.desc}
      />
    </GenericForm>
  );
}
