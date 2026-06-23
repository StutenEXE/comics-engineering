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
  const schema = z.object({
    name: z.string().min(1, t("generic.required", { capitalize: true })),
    ongoing: z.boolean(),
    oneshot: z.boolean(),
    nvolumes: z.coerce
      .number()
      .gte(0, t("serie.form.nvolumes.gte0"))
      .optional(),
  });

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

  return (
    <GenericForm
      title={
        action === "update"
          ? t("serie.form.title.modify")
          : t("serie.form.title.create")
      }
      onCancel={noPropagationEvt(onCancel)}
      submitLabel={
        action === "update" ? t("serie.form.modify") : t("serie.form.create")
      }
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
    </GenericForm>
  );
}
