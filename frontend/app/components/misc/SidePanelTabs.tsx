import { useId, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface SidePanelTab {
  id: string;
  label: string;
  // Shown instead of the label when the tab is alone (no tab bar)
  title?: string;
  // Undefined while loading
  count?: number;
  // Ex : nothing to show once loaded
  hidden?: boolean;
  content: ReactNode;
}

interface SidePanelTabsProps {
  tabs: SidePanelTab[];
  activeId?: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Side panel of the info pages (ex : relations, change history) : one tab shown at a time
 */
export function SidePanelTabs({
  tabs,
  activeId,
  onChange,
  className,
}: SidePanelTabsProps) {
  const baseId = useId();
  const visibleTabs = tabs.filter((tab) => !tab.hidden);
  // Falls back to the first tab when the active one is hidden (ex : no relation)
  const active =
    visibleTabs.find((tab) => tab.id === activeId) ?? visibleTabs[0];

  if (!active) return null;

  const labelClassName =
    "text-xs font-medium uppercase tracking-widest whitespace-nowrap";

  return (
    <div className={twMerge("flex flex-col gap-3", className)}>
      {visibleTabs.length === 1 ? (
        <span className={twMerge(labelClassName, "text-white/40")}>
          {active.title ?? active.label}
        </span>
      ) : (
        <div role="tablist" className="flex gap-4 border-b border-white/10">
          {visibleTabs.map((tab) => {
            const isActive = tab.id === active.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-${tab.id}-tab`}
                aria-selected={isActive}
                aria-controls={`${baseId}-${tab.id}-panel`}
                onClick={() => onChange(tab.id)}
                className={twMerge(
                  labelClassName,
                  "-mb-px pb-2 border-b-2 cursor-pointer transition-colors",
                  isActive
                    ? "text-white/80 border-indigo-400/70"
                    : "text-white/40 border-transparent hover:text-white/60",
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 text-white/30">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <div
        role={visibleTabs.length > 1 ? "tabpanel" : undefined}
        id={`${baseId}-${active.id}-panel`}
        aria-labelledby={
          visibleTabs.length > 1 ? `${baseId}-${active.id}-tab` : undefined
        }
      >
        {active.content}
      </div>
    </div>
  );
}
