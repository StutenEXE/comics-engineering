import Tooltip from "@mui/material/Tooltip";
import { GoQuestion } from "react-icons/go";

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
    <Tooltip id="tooltip" title={tooltipContent} placement={placement} arrow>
      <GoQuestion size={size} className="inline-block text-xs text-white/40" />
    </Tooltip>
  );
}
