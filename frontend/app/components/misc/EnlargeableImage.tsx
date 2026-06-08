import { useEffect, useState } from "react";
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
  const [animateOpen, setAnimateOpen] = useState(false);

  useEffect(() => {
    // Reset animation on close
    if (!open) {
      setAnimateOpen(false);
      return;
    }

    // Callback after animation
    requestAnimationFrame(() => {
      setAnimateOpen(true);
    });
  }, [open]);

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
            className="fixed inset-0 z-[51] flex items-center justify-center bg-black/50 cursor-zoom-out"
          >
            <img
              {...props}
              className={twMerge(
                "max-w-full max-h-full object-contain transition-all duration-300 ease-out",
                animateOpen ? "opacity-100 scale-100" : "opacity-0 scale-95",
              )}
            />
          </div>,
          portalTarget,
        )}
    </>
  );
}
