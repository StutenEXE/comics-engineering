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
      startDate: zDateRequired(t("form.required")).default(serie?.startDate || new Date()),
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
  const [minEndDate, setMinEndDate] = useState(toHtmlInputString(serie?.startDate));

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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-white/40">
          {t("serie.name")}
        </label>
        <input
          {...register("name")}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
        />
        {errors.name && (
          <p className="text-xs text-rose-400/80">{errors.name.message}</p>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              {...register("ongoing")}
              className="peer sr-only"
            />
            <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-white/40" />
            <svg
              className="absolute inset-0 m-auto w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M1.5 5l2.5 2.5 4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">
            {t("serie.ongoing")}
          </span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              {...register("oneshot")}
              className="peer sr-only"
            />
            <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all group-hover:border-white/40" />
            <svg
              className="absolute inset-0 m-auto w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 10 10"
              fill="none"
            >
              <path
                d="M1.5 5l2.5 2.5 4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">
            {t("serie.oneshot")}
          </span>
        </label>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("serie.startDate")}
          </label>
          <input
            type="date"
            {...register("startDate", {
              onChange: onStartDateChange,
              valueAsDate: true,
            })}
            defaultValue={toHtmlInputString(serie?.startDate)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all [color-scheme:dark] w-full"
          />
          {errors.startDate && (
            <p className="text-xs text-rose-400/80">
              {errors.startDate.message}
            </p>
          )}
        </div>

        <span className="text-white/20 mt-5 text-lg">→</span>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium uppercase tracking-widest text-white/40">
            {t("serie.endDate")}
          </label>
          <input
            type="date"
            disabled={endDateDisabled}
            min={minEndDate}
            defaultValue={serie?.endDate ? toHtmlInputString(serie?.endDate) : undefined}
            {...register("endDate", {
              valueAsDate: true,
            })}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white/80 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all [color-scheme:dark] w-full disabled:opacity-30 disabled:cursor-not-allowed"
          />
          {errors.endDate && (
            <p className="text-xs text-rose-400/80">{errors.endDate.message}</p>
          )}
        </div>
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
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40"
        >
          { serie ?  t("serie.form.modify") : t("serie.form.create")}
        </GenericButton>
      </div>
    </form>
  );
}
