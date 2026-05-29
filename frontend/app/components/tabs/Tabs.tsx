import { useEffect, useState, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTabId,
  onChange,
  className = "",
}: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || tabs[0]?.id || "",
  );

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  useEffect(() => {
    handleTabClick(activeTabId);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap cursor-pointer
                            ${
                              activeTabId === tab.id
                                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }
                        `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab && <div className="animate-fadeIn">{activeTab.content}</div>}
      </div>
    </div>
  );
}
