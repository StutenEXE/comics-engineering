import type { ReactNode } from "react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "../shadcn/ui/tooltip";

interface TooltipProps {
  trigger: ReactNode;
  content: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delay?: number;
}

export function Tooltip({
  trigger,
  content,
  side = "top",
  delay = 0,
}: TooltipProps) {
  return (
    <ShadcnTooltip delayDuration={delay}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </ShadcnTooltip>
  );
}
