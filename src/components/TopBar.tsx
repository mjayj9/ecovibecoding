import { useState } from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, X, Camera, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../hooks/useUser';

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-gray-100"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-900">사용 안내</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">제보하는 법</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  지도 탭에서 '주변 생물 제보하기'를 누르고 직접 사진을 찍어 올려주세요. EXIF 데이터를 통해 위치가 자동으로 기록됩니다.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">EXP 올리는 법</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  생물을 제보하거나 생태 퀴즈를 맞히면 경험치(EXP)가 오릅니다. 레벨을 올려 시민 과학자로 성장해보세요!
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">안전 수칙</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  야생 동물에게 너무 가까이 다가가지 마세요! 위치는 철저히 암호화되어 보호종의 서식지를 지킵니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function TopBar() {
  const { userData } = useUser();
  const [showHelp, setShowHelp] = useState(false);
  const role = userData?.role || 'general';

  return (
    <>
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
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 px-3 py-1.5 rounded-full items-center">
            <span className={`text-[10px] font-bold ${role === 'general' ? 'text-[#2D6A4F]' : 'text-[#E67E22]'}`}>
              {role === 'general' ? 'Lv.1 일반대원' : '국가 생태계 보안 관제'}
            </span>
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="p-1.5 bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full transition-colors active:scale-95"
            aria-label="도움말"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}
