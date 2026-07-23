import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import z from "zod";
import { useTranslation } from "~/i18n/i18n";
import { editionToDTO, editionToSimpleEdition } from "~/models/edition";
import { type OwnedEdition, type OwnedEditionDTO } from "~/models/ownedEdition";
import {
  toHtmlInputString,
  toYYYYmmDD,
  zDateOptional,
  zDateRequired,
} from "~/utils/date";
import { noPropagationEvt } from "~/utils/events";
import { EditionCard } from "../cards/EditionCard";
import { CheckboxRhfInput } from "./fields/CheckboxRhfInput";
import { DateRhfInput } from "./fields/DateRhfInput";
import { TextAreaRhfInput } from "./fields/TextAreaRhfInput";
import { TextRhfInput } from "./fields/TextRhfInput";
import { GenericForm } from "./GenericForm";
import { useAppSelector } from "~/store/hooks";
import { formatCurrency } from "~/utils/currency";

interface OwnedEditionFormProps {
  ownedEdition: Partial<OwnedEdition>;
  action: "create" | "update";
  onSubmit?: (oe: Partial<OwnedEditionDTO>) => void;
  onCancel?: () => void;
}

export function OwnedEditionForm({
  ownedEdition,
  action,
  onSubmit = () => {},
  onCancel = () => {},
}: OwnedEditionFormProps) {
  const { t, locale } = useTranslation();

  const { user } = useAppSelector((state) => state.user);

  // Validation schema
  const schema = z.object({
    date: zDateRequired(t("generic.required", { capitalize: true })),
    read: z.boolean(),
    dateRead: zDateOptional(),
    gift: z.boolean(),
    signed: z.boolean(),
    purchasePrice: z.coerce.number().gte(0, t("book.form.number.gte0")),
    fees: z.coerce.number().gte(0, t("book.form.number.gte0")),
    retailPrice: z.coerce.number().gte(0, t("book.form.number.gte0")),
    note: z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;
  // Form operations
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: ownedEdition.date,
      read: ownedEdition.read,
      dateRead: ownedEdition.dateRead,
      gift: ownedEdition.gift,
      signed: ownedEdition.signed,
      purchasePrice: ownedEdition.purchasePrice ?? ownedEdition.edition?.price,
      fees: ownedEdition.fees ?? 0,
      retailPrice: ownedEdition.retailPrice ?? ownedEdition.edition?.price,
      note: ownedEdition.note,
    },
  });

  const triggerSubmission = (data: FieldValues) => {
    const newOwnedEdition: Partial<OwnedEditionDTO> = {
      id: ownedEdition.id,
      date: data.date,
      read: data.read,
      dateRead: data.dateRead,
      gift: data.gift,
      signed: data.signed,
      purchasePrice: data.purchasePrice,
      fees: data.fees,
      retailPrice: data.retailPrice,
      note: data.note,
      edition: editionToDTO(ownedEdition.edition!),
      user: ownedEdition.user || user!,
    };
    onSubmit?.(newOwnedEdition);
  };

  // Realtime updates
  const watchedRead = watch("read") as boolean;
  const watchedPurchase = watch("purchasePrice") as number | undefined;
  const watchedFees = watch("fees") as number | undefined;
  const watchedRetailPrice = watch("retailPrice") as number | undefined;

  const totalCost = Number(watchedPurchase || 0) + Number(watchedFees || 0);
  const savings = Number(watchedRetailPrice || 0) - totalCost;

  const handleCancel = () => {
    onCancel();
  };

  return (
    <GenericForm
      title={
        action === "update"
          ? t("oedition.form.title.modify")
          : t("oedition.form.title.create")
      }
      onCancel={noPropagationEvt(handleCancel)}
      submitLabel={
        action === "update"
          ? t("oedition.form.modify")
          : t("oedition.form.create")
      }
      onSubmit={handleSubmit(triggerSubmission)}
    >
      <div className="flex gap-3">
        <EditionCard
          disableInteractions
          edition={
            ownedEdition?.edition
              ? editionToSimpleEdition(ownedEdition.edition)
              : undefined
          }
          className="w-35 h-min"
        />
        <div className="flex flex-col gap-2">
          {/* Add Date */}
          <DateRhfInput
            label={t("oedition.addDate")}
            registration={register("date")}
            error={errors.date}
            className="max-w-60"
          />
          <div className="flex gap-3">
            {/* Read */}
            <CheckboxRhfInput
              label={t("oedition.read")}
              registration={register("read")}
              error={errors.read}
            />
            {/* Date Read */}
            <DateRhfInput
              label={t("oedition.dateRead")}
              registration={register("dateRead")}
              invisible={!watchedRead}
              error={errors.dateRead}
            />
          </div>

          <div className="w-[100%] flex gap-12">
            <div className="flex gap-6">
              {/* Gift */}
              <CheckboxRhfInput
                label={t("oedition.gift")}
                registration={register("gift")}
                error={errors.gift}
              />
              {/* Signed */}
              <CheckboxRhfInput
                label={t("oedition.signed")}
                registration={register("signed")}
                error={errors.signed}
              />
            </div>
          </div>

          <div>
            <div className="flex gap-6 mt-2">
              {/* Purchase Price */}
              <TextRhfInput
                className="w-30"
                label={t("oedition.purchasePrice")}
                registration={register("purchasePrice")}
                inputProps={{
                  type: "number",
                  step: ".01",
                  inputMode: "numeric",
                  min: 0,
                }}
                error={errors.purchasePrice}
              />
              {/* Fees */}
              <TextRhfInput
                className="w-30"
                label={t("oedition.fees")}
                registration={register("fees")}
                inputProps={{
                  type: "number",
                  step: ".01",
                  inputMode: "numeric",
                  min: 0,
                }}
                error={errors.fees}
                tooltip={t("oedition.feesExplanation")}
              />
              {/* Retail Price */}
              <TextRhfInput
                className="w-35"
                label={t("oedition.retailPrice")}
                registration={register("retailPrice")}
                inputProps={{
                  type: "number",
                  step: ".01",
                  inputMode: "numeric",
                  min: 0,
                }}
                error={errors.retailPrice}
                tooltip={t("oedition.retailPriceExplanation")}
              />
            </div>

            <div className="mt-2 text-white/40 text-xs">
              <span className="text-white/40 text-xs">
                {t("generic.currencyDisclaimer")}
              </span>
              <br />
              <span>
                {t("oedition.totalCost")} :{" "}
                {formatCurrency(totalCost, "EUR", locale)}
                {savings > 0 &&
                  `(${t("oedition.saved")} ${formatCurrency(savings, "EUR", locale)})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TextAreaRhfInput
        label={t("oedition.note")}
        registration={register("note")}
        error={errors.note}
      />
    </GenericForm>
  );
}
