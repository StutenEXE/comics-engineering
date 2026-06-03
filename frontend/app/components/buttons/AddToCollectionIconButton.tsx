import { Tooltip } from "@mui/material";
import { type MouseEventHandler } from "react";
import {
  BsFillBookmarkCheckFill,
  BsFillBookmarkPlusFill,
} from "react-icons/bs";

import { twMerge } from "tailwind-merge";
import { useTranslation } from "~/i18n/i18n";

interface AddToCollectionIconButtonProps {
  onClick?: MouseEventHandler;
  size?: number;
  hidden?: boolean;
  alreadyAdded?: boolean;
  className?: string;
}

export function AddToCollectionIconButton({
  onClick,
  size = 16,
  hidden,
  alreadyAdded,
  className,
}: AddToCollectionIconButtonProps) {
  const { t } = useTranslation();

  if (hidden) return null;

  if (alreadyAdded) {
    return (
      <Tooltip title={t("edition.inCollection")} placement="top" arrow>
        <div
          className={twMerge("p-1 bg-green-600 rounded text-white", className)}
        >
          <BsFillBookmarkCheckFill
            size={size}
            role={onClick ? "button" : undefined}
          />
        </div>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t("edition.addToCollection")} placement="top" arrow>
      <button
        type="button"
        onClick={onClick}
        className={twMerge(
          "p-1 bg-white/70 text-gray-600 shadow-md rounded transition duration-150 ease-in-out cursor-pointer",
          "hover:scale-105 hover:bg-green-400 hover:text-white active:scale-95",
          className,
        )}
      >
        <BsFillBookmarkPlusFill
          size={size}
          className="pointer-events-none"
          aria-hidden="true"
        />
      </button>
    </Tooltip>
  );
}
