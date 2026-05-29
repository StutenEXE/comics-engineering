import { type MouseEventHandler } from "react";
import { BsFillBookmarkCheckFill, BsFillBookmarkPlusFill } from "react-icons/bs";

import { twMerge } from "tailwind-merge";

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
  if (hidden) return <></>;

  return (
    <>
      {!alreadyAdded && (
        <BsFillBookmarkPlusFill
          size={size}
          className={twMerge(
            "text-gray-400 cursor-pointer transition duration-150 ease-in-out hover:scale-110 hover:text-green-400",
            className,
          )}
          onClick={onClick}
          role={onClick ? "button" : undefined}
        />
      )}
      {alreadyAdded && (
        <BsFillBookmarkCheckFill
          size={size}
          className={twMerge(
            "text-green-600",
            className,
          )}
          role={onClick ? "button" : undefined}
        />
      )}
    </>
  );
}
