import { Tab } from '../types';
import { Home, Map as MapIcon, Newspaper, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'map', label: '탐색/제보', icon: MapIcon },
    { id: 'news', label: '뉴스', icon: Newspaper },
    { id: 'my', label: '마이', icon: UserCircle },
  ] as const;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe z-50">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[64px] transition-colors",
              isActive ? "text-[#2D6A4F]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-2xl transition-all duration-300",
              isActive ? "bg-[#2D6A4F]/10" : "bg-transparent"
            )}>
              <Icon className={cn("w-6 h-6", isActive && "fill-current")} strokeWidth={isActive ? 2 : 1.5} />
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
