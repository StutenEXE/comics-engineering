import { useEffect, useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { useTranslation } from "~/i18n/i18n";
import {
  ContributionActionEnum,
  ContributionTypeEnum,
  type SimpleContribution,
} from "~/models/contribution";
import type { Serie } from "~/models/serie";
import { noPropagationEvt } from "~/utils/events";
import { GenericButton } from "../buttons/GenericButton";
import z, { date } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toHtmlInputString, zDateOptional, zDateRequired } from "~/utils/date";
import { TextRhfInput } from "./fields/TextRhfInput";
import { CheckboxRhfInput } from "./fields/CheckboxRhfInput";
import { DateRhfInput } from "./fields/DateRhfInput";
import { DateRangeRhfInput } from "./fields/DateRangeRhfInput";
import { Label } from "@mui/icons-material";

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
      name: z.string().min(1, t("serie.form.name.required")),
      ongoing: z.boolean(),
      oneshot: z.boolean(),
      startDate: zDateRequired(t("form.required")).default(
        serie?.startDate || new Date(),
      ),
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
      // dates set manually
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newSerie: Partial<Serie> = {
      id: serie?.id,
      name: data.name,
      ongoing: data.ongoing,
      oneshot: data.oneshot,
      startDate: data.startDate,
      endDate: data.endDate,
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

    onSubmit && onSubmit(contrib);
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
        label={t("serie.name")}
        registration={register("name")}
        error={errors.name}
      />

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
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40"
        >
          {serie ? t("serie.form.modify") : t("serie.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
