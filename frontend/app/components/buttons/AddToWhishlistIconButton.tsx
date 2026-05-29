import { type MouseEventHandler } from "react";
import { FaHeart } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

interface AddToWhishlistIconButtonProps {
  onClick?: MouseEventHandler;
  size?: number;
  hidden?: boolean;
  alreadyAdded?: boolean;
  className?: string;
}

export function AddToWhishlistIconButton({
  onClick,
  size = 16,
  hidden,
  alreadyAdded,
  className,
}: AddToWhishlistIconButtonProps) {
  if (hidden) return <></>;

  // Create style
  let style = twMerge(
    "text-gray-400 cursor-pointer transition duration-150 ease-in-out hover:scale-110 hover:text-red-400",
    className,
  );
  if (alreadyAdded) {
    style = twMerge(style, "text-red-600");
  }
  return (
    <FaHeart
      size={size}
      className={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    />
  );
}
