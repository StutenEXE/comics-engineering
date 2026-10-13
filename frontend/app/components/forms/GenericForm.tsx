import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import { GenericButton } from "../buttons/GenericButton";
import { noPropagationEvt } from "~/utils/events";
import LoadingBadge from "../badges/LoadingBadge";

// Fixed widths so that forms don't resize while the user types / selects,
// capped by the viewport on small screens
const formWidths = {
  sm: "w-[min(28rem,calc(100vw-2rem))]",
  md: "w-[min(36rem,calc(100vw-2rem))]",
  lg: "w-[min(48rem,calc(100vw-2rem))]",
};

interface GenericFormProps {
  title: string;
  cancelLabel?: string;
  onCancel?: (e: React.BaseSyntheticEvent) => void;
  submitLabel?: string;
  onSubmit?: (event: React.SubmitEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: keyof typeof formWidths;
  children?: React.ReactNode;
}

export function GenericForm({
  title,
  cancelLabel,
  onCancel,
  submitLabel,
  onSubmit,
  disabled,
  isLoading = false,
  size = "md",
  children,
}: GenericFormProps) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={onSubmit}
      className={twMerge("flex flex-col", formWidths[size])}
    >
      {/* Title */}
      <h2 className="px-6 pt-5 pb-4 text-lg font-semibold text-zinc-100 border-b border-zinc-800">
        {title}
      </h2>

      <div className="flex flex-col gap-6 px-6 py-5">{children}</div>

      {/* Actions : stay visible while scrolling long forms */}
      <div className="sticky bottom-0 flex justify-end gap-2 px-6 py-3 border-t border-zinc-800 bg-zinc-950">
        <GenericButton
          onClick={onCancel}
          className="h-9 px-4 rounded-md bg-transparent text-zinc-300 font-medium text-sm hover:bg-zinc-800 hover:text-zinc-100"
        >
          {cancelLabel ?? t("generic.cancel", { capitalize: true })}
        </GenericButton>
        <GenericButton
          type="submit"
          onClick={noPropagationEvt()}
          disabled={disabled}
          className="h-9 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm disabled:bg-indigo-600 disabled:opacity-40"
        >
          {submitLabel ?? t("generic.submit", { capitalize: true })}
          <LoadingBadge className="text-white" isLoading={isLoading} />
        </GenericButton>
      </div>
    </form>
  );
}
