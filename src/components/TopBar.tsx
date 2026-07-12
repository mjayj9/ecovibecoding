import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useUser } from '../hooks/useUser';

export function TopBar() {
  const { userData } = useUser();
  const role = userData?.role || 'general';

  return (
    <div className="bg-white px-4 py-3 shadow-sm z-10 flex items-center justify-between sticky top-0">
      <div className="flex items-center gap-2">
        {role === 'general' ? (
          <ShieldCheck className="w-6 h-6 text-[#2D6A4F]" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-[#E67E22]" />
        )}
        <h1 className="font-bold text-lg text-[#1A365D] tracking-tight">
          {role === 'general' ? 'Eco Explorer' : 'Eco Command'}
        </h1>
      </div>
      
      <div className="flex bg-gray-100 px-3 py-1.5 rounded-full items-center">
        <span className={`text-[10px] font-bold ${role === 'general' ? 'text-[#2D6A4F]' : 'text-[#E67E22]'}`}>
          {role === 'general' ? 'Lv.1 일반대원' : '국가 생태계 보안 관제'}
        </span>
      </div>
    </div>
  );
}
