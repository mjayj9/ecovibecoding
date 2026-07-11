import { UserMode } from '../types';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

export function TopBar({ mode, setMode }: TopBarProps) {
  return (
    <div className="bg-white px-4 py-3 shadow-sm z-10 flex items-center justify-between sticky top-0">
      <div className="flex items-center gap-2">
        {mode === 'general' ? (
          <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-[#E67E22]" />
        )}
        <h1 className="font-bold text-lg text-[#1A365D] tracking-tight">
          {mode === 'general' ? 'Eco Explorer' : 'Eco Command'}
        </h1>
      </div>
      
      <div className="flex bg-gray-100 p-1 rounded-full relative">
        <button
          onClick={() => setMode('general')}
          className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            mode === 'general' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          일반 대원
        </button>
        <button
          onClick={() => setMode('scientist')}
          className={`relative z-10 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            mode === 'scientist' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          시민 과학자
        </button>
        <div
          className="absolute inset-y-1 w-[80px] bg-[#1B4332] rounded-full transition-transform duration-300 ease-in-out shadow-sm"
          style={{
            transform: mode === 'general' ? 'translateX(0)' : 'translateX(84px)',
          }}
        />
      </div>
    </div>
  );
}
