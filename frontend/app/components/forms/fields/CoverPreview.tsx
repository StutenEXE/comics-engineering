import { useEffect, useState } from "react";
import { LuImage } from "react-icons/lu";

interface CoverPreviewProps {
  src?: string;
  alt: string;
}

// Fixed size frame so that the layout doesn't jump when the image loads / changes
export function CoverPreview({ src, alt }: CoverPreviewProps) {
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [src]);

  return (
    <div className="w-20 h-28 shrink-0 flex items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
      {src && !broken ? (
        <img
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <LuImage size={20} className="text-zinc-600" />
      )}
    </div>
  );
}
