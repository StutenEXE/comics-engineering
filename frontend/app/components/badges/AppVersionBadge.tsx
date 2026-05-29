import React from 'react';

type AppVersionBadgeProps = {
  version: string;
};

export function AppVersionBadge({ version }: AppVersionBadgeProps) {
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded border text-cyan-400/70 border-cyan-400/20 bg-cyan-400/5`}>
      {version}
    </span>
  );
}
