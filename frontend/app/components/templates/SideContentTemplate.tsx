import { SideContentHeader } from "../headers/SideContentHeader";

interface SideContentTemplateProps {
  title?: string;
  children: React.ReactNode;
}

export function SideContentTemplate({
  title,
  children,
}: SideContentTemplateProps) {
  return (
    <div>
      <SideContentHeader title={title} />
      <main className="w-full py-4 px-4 flex flex-col gap-6 relative">
        {children}
      </main>
    </div>
  );
}
