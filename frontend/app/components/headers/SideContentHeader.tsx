import type { ReactNode } from "react";
import { Tooltip } from "../misc/Tooltip";
import { Separator } from "../shadcn/ui/separator";
import { SidebarTrigger, useSidebar } from "../shadcn/ui/sidebar";

interface SideContentHeaderProps {
  title?: string;
  // Shown on the right (ex : page level controls)
  actions?: ReactNode;
}

export function SideContentHeader({ title, actions }: SideContentHeaderProps) {
  const { isMobile } = useSidebar();

  return (
    // Sticks under the main header so the sidebar toggle stays reachable while scrolling
    <header className="sticky top-(--header-height) z-20 flex h-13 shrink-0 items-center gap-2 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {/* No shortcut tooltip on touch screens : a tap would open the tooltip
            along with the mobile sheet, which then closes itself right away */}
        {isMobile ? (
          <SidebarTrigger className="-ml-2 size-10 cursor-pointer text-white/60 hover:text-white [&_svg]:size-5" />
        ) : (
          <Tooltip
            side="right"
            delay={500}
            trigger={
              <SidebarTrigger className="-ml-1 cursor-pointer text-white/60 hover:text-white" />
            }
            content={
              <p>
                <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>B</kbd>
              </p>
            }
          />
        )}
        <Separator orientation="vertical" className="mx-2 h-4! bg-white/10" />
        <h1 className="text-base font-medium text-white/85 truncate">
          {title}
        </h1>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
