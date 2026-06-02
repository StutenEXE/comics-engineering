interface GenericPageTemplateProps {
  children: React.ReactNode;
}

export function GenericPageTemplate({ children }: GenericPageTemplateProps) {
  return (
    <main className="flex flex-col items-center py-8 px-4 lg:px-8 xl:px-12">
      <div className="w-full max-w-6xl space-y-8">{children}</div>
    </main>
  );
}
