import { useState } from "react";
import { createPortal } from "react-dom";
import type { ImgHTMLAttributes, MouseEvent } from "react";
import { twMerge } from "tailwind-merge";
import { noPropagationEvt } from "~/utils/events";

export interface EnlargeableImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export function EnlargeableImage({
  className,
  style,
  onClick,
  ...props
}: EnlargeableImageProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLImageElement>) => {
    onClick?.(event);
    setOpen(true);
  };

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <>
      <img
        {...props}
        className={twMerge(
          "cursor-zoom-in transition duration-150 ease-in-out hover:scale-105",
          className,
        )}
        onClick={handleClick}
      />

      {open &&
        portalTarget &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged image"
            onClick={noPropagationEvt(() => setOpen(false))}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 cursor-zoom-out"
          >
            <img
              {...props}
              className="max-w-[100%] max-h-[100%] object-contain"
            />
          </div>,
          portalTarget,
        )}
    </>
  );
}
