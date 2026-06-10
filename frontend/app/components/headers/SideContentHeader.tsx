import { Tooltip } from "../misc/Tooltip";
import { Separator } from "../shadcn/ui/separator";
import { SidebarTrigger } from "../shadcn/ui/sidebar";

interface SideContentHeaderProps {
  title?: string;
}

export function SideContentHeader({ title }: SideContentHeaderProps) {
  return (
    <header className="flex h-13 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Tooltip
          side="left"
          delay={500}
          trigger={<SidebarTrigger className="-ml-1 cursor-pointer" />}
          content={
            <p>
              <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>B</kbd>
            </p>
          }
        />
        <Separator orientation="vertical" className="mx-2" />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
