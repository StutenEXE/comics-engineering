import { useTranslation } from "~/i18n/i18n";
import { GenericButton } from "../buttons/GenericButton";
import { noPropagationEvt } from "~/utils/events";

interface GenericFormProps {
  title: string;
  cancelLabel?: string;
  onCancel?: (e: React.BaseSyntheticEvent) => void;
  submitLabel?: string;
  onSubmit?: (event: React.SubmitEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function GenericForm({
  title,
  cancelLabel,
  onCancel,
  submitLabel,
  onSubmit,
  disabled,
  children,
}: GenericFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
      {/* Title */}
      <h2 className="text-lg font-semibold tracking-wide text-white/90 text-center border-b border-white/10 pb-4">
        {title}
      </h2>

      {children}

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-2 border-t border-white/10">
        <GenericButton
          onClick={onCancel}
          className="flex-1 bg-white/5 border border-white/10 text-white/60 font-medium text-sm py-2 rounded-md hover:bg-white/10 hover:text-white/80 transition-all"
        >
          {cancelLabel ?? t("generic.cancel", { capitalize: true })}
        </GenericButton>
        <GenericButton
          type="submit"
          onClick={noPropagationEvt()}
          disabled={disabled}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 rounded-md transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitLabel ?? t("generic.submit", { capitalize: true })}
        </GenericButton>
      </div>
    </form>
  );
}
