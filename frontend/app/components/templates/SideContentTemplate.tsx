import { SideContentHeader } from "../headers/SideContentHeader";

interface GenericPageTemplateProps {
  title?: string;
  children: React.ReactNode;
}

export function SideContentTemplate({
  title,
  children,
}: GenericPageTemplateProps) {
  return (
    <div>
      <SideContentHeader title={title} />
      <main className="w-full w-full py-4 px-4">{children}</main>
    </div>
  );
}
