import { UserMode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Shield, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  mode: UserMode;
  name: string;
  onClose: () => void;
}

export function CertificateModal({ mode, name, onClose }: CertificateModalProps) {
  const today = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());

  const title = mode === 'general' ? '생태 수호 일반 대원' : '국가 생태계 시민 과학자';
  const description = mode === 'general' 
    ? '위 사람은 자연을 사랑하는 마음으로 올바른 생태 지식을 습득하고 보호 수칙을 준수할 것을 다짐하였기에 이 증서를 수여합니다.'
    : '위 사람은 투철한 보안 의식과 객관적인 검증 데이터를 바탕으로 국가 생태계 관제 및 보호에 기여할 것을 다짐하였기에 이 증서를 수여합니다.';

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
          {/* Header decorative bg */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] transform -skew-y-6 origin-top-left scale-110" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative pt-12 pb-8 px-6 text-center">
            <div className="mx-auto w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center rotate-3 border border-gray-50 mb-6 relative">
              {mode === 'general' ? (
                <Shield className="w-10 h-10 text-[#2D6A4F]" />
              ) : (
                <Award className="w-10 h-10 text-[#1B4332]" />
              )}
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>

            <div className="space-y-1 mb-8">
              <h2 className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Certificate of Appointment</h2>
              <h1 className="text-2xl font-bold text-[#1A365D] tracking-tight">{title}</h1>
            </div>

            <div className="space-y-6">
              <div className="border-b-2 border-dashed border-gray-200 pb-2 inline-block px-8">
                <span className="text-xl font-bold text-gray-900 font-serif">{name}</span>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {description}
              </p>
            </div>

            <div className="mt-10 flex justify-between items-end border-t border-gray-100 pt-6">
              <div className="text-left">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date</div>
                <div className="text-xs font-medium text-gray-900">{today}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Authorized By</div>
                <div className="text-xs font-bold text-[#1B4332]">Eco-Tech Command</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
