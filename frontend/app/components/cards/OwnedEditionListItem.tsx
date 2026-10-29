import type { ReactNode } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";
import type { OwnedEdition } from "~/models/ownedEdition";

interface OwnedEditionActionsProps {
  onEdit: () => void;
  onRemove: () => void;
  className?: string;
}

/**
 * Edit / remove buttons of a collection row, large enough to be tapped
 */
export function OwnedEditionActions({
  onEdit,
  onRemove,
  className,
}: OwnedEditionActionsProps) {
  const { t } = useTranslation();
  const buttonClassName =
    "flex size-9 cursor-pointer items-center justify-center rounded-md text-white/45 transition-colors focus-visible:outline-2 focus-visible:outline-stash-400/60";

  return (
    <div className={twMerge("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={onEdit}
        aria-label={t("generic.edit")}
        title={t("generic.edit")}
        className={twMerge(buttonClassName, "hover:bg-white/8 hover:text-white")}
      >
        <MdModeEdit size={18} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("generic.remove")}
        title={t("generic.remove")}
        className={twMerge(buttonClassName, "hover:bg-red-500/10 hover:text-red-400")}
      >
        <MdDelete size={18} />
      </button>
    </div>
  );
}

interface OwnedEditionListItemProps extends OwnedEditionActionsProps {
  oedition: OwnedEdition;
  // Opens the edition details
  onOpen: () => void;
  // Lines under the title (ex : prices)
  children?: ReactNode;
}

/**
 * Collection row shown as a card on small screens (see GenericTable's renderCard)
 */
export function OwnedEditionListItem({
  oedition,
  onOpen,
  onEdit,
  onRemove,
  children,
}: OwnedEditionListItemProps) {
  const { t } = useTranslation();
  const { edition } = oedition;

  return (
    <div className="flex items-start gap-3 px-3 py-3 transition-colors hover:bg-white/3">
      <button
        type="button"
        onClick={onOpen}
        aria-label={edition.book?.name}
        className="shrink-0 cursor-pointer overflow-hidden rounded border border-white/8"
      >
        <img
          src={edition.imgUrl || "/placeholder.jpg"}
          alt=""
          className="aspect-[2/3] w-12 object-cover sm:w-14"
        />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          type="button"
          onClick={onOpen}
          className="cursor-pointer truncate text-left text-sm font-medium text-white/85 hover:underline"
        >
          {edition.book?.name}
        </button>
        <p className="truncate text-xs text-white/45">
          {[
            edition.serie?.name,
            edition.book?.number &&
              `${t("generic.volume", { capitalize: true })} ${edition.book.number}`,
            edition.publisher?.name,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {children}
      </div>
      <OwnedEditionActions
        onEdit={onEdit}
        onRemove={onRemove}
        className="-mr-1 shrink-0"
      />
    </div>
  );
}
