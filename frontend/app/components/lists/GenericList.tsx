import type { JSX } from "react";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import LoadingBadge from "../badges/LoadingBadge";

interface GenericListProps<T> {
  list: T[] | null | undefined;
  emptyMsg: string;
  elemGenerator: (l: T) => JSX.Element;
  vertical?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function GenericList<T>({
  list,
  emptyMsg,
  elemGenerator,
  vertical,
  isLoading,
  className,
}: GenericListProps<T>) {
  const { t } = useTranslation();

  const isEmpty = !list || list.length === 0;

  const divClassName = vertical
    ? twMerge(
        "flex flex-col gap-1 p-2 max-h-64 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
        className,
      )
    : twMerge(
        "flex flex-row gap-3 p-2 overflow-x-auto overflow-y-hidden snap-x snap-mandatory [&>*]:snap-start [&>*]:shrink-0",
        className,
      );

  return (
    <div className={divClassName}>
      {isLoading && (
        <p className="flex gap-1 text-xs text-white/30 italic px-1 py-2">
          {t("generic.loading", { capitalize: true })}{" "}
          <LoadingBadge className="text-white/30" />
        </p>
      )}
      {!isLoading && isEmpty && (
        <p className="text-xs text-white/30 italic px-1 py-2">{emptyMsg}</p>
      )}
      {!isLoading && !isEmpty && list.map(elemGenerator)}
    </div>
  );
}
