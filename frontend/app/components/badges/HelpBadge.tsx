import { GoQuestion } from "react-icons/go";
import { Tooltip } from "../misc/Tooltip";
// import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/ui/tooltip";

interface HelpBadgeTooltipProps {
  size?: number;
  tooltipContent: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export function HelpBadgeTooltip({
  size = 14,
  tooltipContent,
  placement = "top",
}: HelpBadgeTooltipProps) {
  return (
    <Tooltip
      delay={100}
      side={placement}
      trigger={
        <GoQuestion
          size={size}
          className="inline-block text-xs text-white/40"
        />
      }
      content={<p>{tooltipContent}</p>}
    />
  );
}
