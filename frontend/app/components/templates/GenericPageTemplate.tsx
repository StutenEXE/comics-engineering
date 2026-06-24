import { twMerge } from "tailwind-merge";

interface GenericPageTemplateProps {
  className?: string;
  children: React.ReactNode;
}

export function GenericPageTemplate({
  className,
  children,
}: GenericPageTemplateProps) {
  return (
    <main
      className={twMerge(
        "flex flex-col items-center py-8 px-4 lg:px-8 xl:px-12",
        className,
      )}
    >
      <div className="w-full max-w-6xl space-y-8">{children}</div>
    </main>
  );
}
