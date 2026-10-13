import { twMerge } from "tailwind-merge";

interface FormSectionProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

// Groups related fields of a form under a small heading
export function FormSection({
  title,
  description,
  className,
  children,
}: FormSectionProps) {
  return (
    <section className={twMerge("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-0.5 border-b border-zinc-800 pb-1.5">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {description && <p className="text-xs text-zinc-400">{description}</p>}
      </div>
      {children}
    </section>
  );
}
