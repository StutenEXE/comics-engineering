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
import type { ContributionSerie, Serie } from "~/models/serie";
import {
  toHtmlInputString,
  toYYYYmmDD,
  zDateOptional,
  zDateRequired,
} from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { CheckboxRhfInput } from "../fields/CheckboxRhfInput";
import { DateRangeRhfInput } from "../fields/DateRangeRhfInput";
import { TextRhfInput } from "../fields/TextRhfInput";
import { GenericForm } from "../GenericForm";

interface SerieFormProps {
  serie?: Serie;
  action: "create" | "update";
  onSubmit?: (c: Partial<SimpleContribution>) => void;
  onCancel?: () => void;
}

export function SerieContributionForm({
  serie,
  action,
  onSubmit,
  onCancel,
}: SerieFormProps) {
  const { t } = useTranslation();

  // Validation schema
  const schema = z
    .object({
      name: z.string().min(1, t("generic.required", { capitalize: true })),
      ongoing: z.boolean(),
      oneshot: z.boolean(),
      nvolumes: z.coerce
        .number()
        .gte(0, t("serie.form.nvolumes.gte0"))
        .optional(),
      startDate: zDateRequired(t("generic.required", { capitalize: true })),
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
      name: serie?.name,
      ongoing: serie?.ongoing,
      oneshot: serie?.oneshot,
      nvolumes: serie?.nvolumes,
      // dates set manually
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newSerie: ContributionSerie = {
      id: serie?.id,
      name: data.name,
      ongoing: data.ongoing,
      oneshot: data.oneshot,
      nvolumes: data.nvolumes,
      startDate: toYYYYmmDD(data.startDate),
      endDate: toYYYYmmDD(data.endDate),
    };
    const contrib: Partial<SimpleContribution> = {
      action:
        action === "create"
          ? ContributionActionEnum.CREATE
          : ContributionActionEnum.UPDATE,
      entityType: ContributionTypeEnum.SERIE,
      proposedData: newSerie,
      entityId: newSerie.id,
    };

    onSubmit?.(contrib);
  };

  // Handle specific UX case : endDate always after startDate
  const [endDateDisabled, setEndDateDisabled] = useState(serie === undefined);
  const [minEndDate, setMinEndDate] = useState(
    toHtmlInputString(serie?.startDate),
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
        serie ? t("serie.form.title.modify") : t("serie.form.title.create")
      }
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={serie ? t("serie.form.modify") : t("serie.form.create")}
      onSubmit={handleSubmit(triggerSubmission)}
    >
      {/* Name field */}
      <TextRhfInput
        label={t("serie.name")}
        registration={register("name")}
        error={errors.name}
      />

      <div className="w-[100%] flex gap-12">
        {/* Checkboxes */}
        <div className="flex gap-6">
          <CheckboxRhfInput
            label={t("serie.ongoing")}
            registration={register("ongoing")}
            error={errors.ongoing}
          />

          <CheckboxRhfInput
            label={t("serie.oneshot")}
            registration={register("oneshot")}
            error={errors.oneshot}
          />
        </div>

        {/* Nvolumes */}
        <TextRhfInput
          label={t("serie.nvolumes")}
          registration={register("nvolumes")}
          inputProps={{ type: "number", inputMode: "numeric", min: 0 }}
          error={errors.nvolumes}
        />
      </div>

      {/* Date range */}
      <DateRangeRhfInput
        startProps={{
          label: t("serie.startDate"),
          registration: register("startDate", {
            onChange: onStartDateChange,
            valueAsDate: true,
          }),
          inputProps: { defaultValue: toHtmlInputString(serie?.startDate) },
          error: errors.startDate,
        }}
        endProps={{
          label: t("serie.endDate"),
          registration: register("endDate", {
            valueAsDate: true,
          }),
          inputProps: {
            disabled: endDateDisabled,
            min: minEndDate,
            defaultValue: serie?.endDate
              ? toHtmlInputString(serie?.endDate)
              : undefined,
          },
          error: errors.startDate,
        }}
      />
    </GenericForm>
  );
}
