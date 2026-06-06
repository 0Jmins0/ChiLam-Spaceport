'use client';

import { cn } from '@/lib/cn';

interface Tab {
  label: string;
  value: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function TabBar({ tabs, activeTab, onTabChange, className }: TabBarProps) {
  return (
    <div className={cn('flex gap-6 border-b border-border-gold', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            'relative pb-3 text-sm tracking-wide transition-colors duration-150',
            activeTab === tab.value ? 'text-accent' : 'text-text-secondary hover:text-accent',
          )}
        >
          {tab.label}
          {activeTab === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
}
