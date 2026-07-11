import { useState } from 'react';
import { UserMode } from '../../types';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { CheckSquare, LogOut, Award, ShieldCheck, Leaf } from 'lucide-react';
import { CertificateModal } from '../CertificateModal';

const PLEDGES = [
  "위치 데이터를 고의로 조작하거나 위조하지 않겠습니다.",
  "서식지 보호를 위해 비공개 원칙을 준수하겠습니다.",
  "현장 방문 시 야생 생태계에 피해를 주지 않겠습니다.",
  "수집된 데이터는 오직 공익적 목적으로만 활용됨에 동의합니다."
];

export function MyTab({ mode, user }: { mode: UserMode, user: User }) {
  const [name, setName] = useState(user.displayName || '');
  const [checkedRules, setCheckedRules] = useState<boolean[]>([false, false, false, false]);
  const [showCertificate, setShowCertificate] = useState(false);

  const toggleRule = (index: number) => {
    const newRules = [...checkedRules];
    newRules[index] = !newRules[index];
    setCheckedRules(newRules);
  };

  const allChecked = checkedRules.every(Boolean) && name.trim().length > 0;

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Profile Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <img 
          src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} 
          alt="Profile" 
          className="w-16 h-16 rounded-full bg-gray-100"
        />
        <div className="flex-1">
          <h2 className="font-bold text-lg text-gray-900">{user.displayName || '탐험가'}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-1 flex gap-2">
             <span className="text-[10px] font-bold bg-[#1B4332] text-white px-2 py-0.5 rounded-full">
              {mode === 'general' ? '일반 대원' : '시민 과학자'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => signOut(auth)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Pledge Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-[#1A365D] mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
          4대 안전 수칙 다짐
        </h3>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">수서/발급용 실명 기입</label>
            <input 
              type="text" 
              placeholder="본명을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-3 pt-2">
            {PLEDGES.map((pledge, idx) => (
              <button 
                key={idx}
                onClick={() => toggleRule(idx)}
                className="flex items-start gap-3 w-full text-left"
              >
                <div className={`mt-0.5 shrink-0 rounded transition-colors ${checkedRules[idx] ? 'text-[#2D6A4F]' : 'text-gray-300'}`}>
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className={`text-sm leading-snug transition-colors ${checkedRules[idx] ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {pledge}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowCertificate(true)}
          disabled={!allChecked}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            allChecked 
              ? 'bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] text-white shadow-lg active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Award className="w-5 h-5" />
          수호 대원 증서 받기
        </button>
      </div>

      {showCertificate && (
        <CertificateModal 
          mode={mode} 
          name={name} 
          onClose={() => setShowCertificate(false)} 
        />
      )}
    </div>
  );
}
