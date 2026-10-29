import type { ReactNode } from "react";
import { SideContentHeader } from "../headers/SideContentHeader";

interface SideContentTemplateProps {
  title?: string;
  // Page level controls, shown in the sticky header
  actions?: ReactNode;
  children: ReactNode;
}

export function SideContentTemplate({
  title,
  actions,
  children,
}: SideContentTemplateProps) {
  return (
    <div className="flex min-w-0 flex-col">
      <SideContentHeader title={title} actions={actions} />
      {/* Same horizontal padding as the header, so the title and the content are aligned */}
      <main className="relative flex w-full min-w-0 flex-col gap-6 px-4 py-5 lg:px-6 lg:py-6">
        {children}
      </main>
    </div>
  );
}
