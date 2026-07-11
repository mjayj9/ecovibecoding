import { useState, useRef, useEffect, ReactNode } from 'react';
import { UserMode } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Camera, AlertOctagon, Scan, ShieldAlert, Fingerprint, Map as MapIcon, Lock, Users, CheckCircle2 } from 'lucide-react';
import { ReportModal } from '../ReportModal';
import { useUser } from '../../hooks/useUser';

export function MapTab({ mode }: { mode: UserMode }) {
  const { userData, updateUserData } = useUser();
  const [reportState, setReportState] = useState<'idle' | 'analyzing' | 'verifying' | 'securing' | 'done' | 'error'>('idle');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const addTimeout = (callback: () => void, delay: number) => {
    const id = setTimeout(callback, delay);
    timeoutRefs.current.push(id);
  };

  const startReport = () => {
    setReportState('analyzing');
    addTimeout(() => setReportState('verifying'), 2500);
    addTimeout(() => setReportState('securing'), 5000);
    addTimeout(() => setReportState('done'), 7500);
  };

  const startErrorFlow = () => {
    setReportState('analyzing');
    addTimeout(() => setReportState('error'), 1500);
  }

  const handleReward = async () => {
    if (!userData) return;
    const newExp = Math.min(100, userData.exp + 15);
    await updateUserData({ exp: newExp });
    setShowRewardToast(true);
    setReportState('idle');
    
    addTimeout(() => {
      setShowRewardToast(false);
    }, 3000);
  };

  if (mode === 'general') {
    return (
      <div className="p-4 space-y-4 animate-in fade-in duration-500 flex flex-col h-full relative">
        <div className="bg-gray-200 rounded-2xl h-64 relative overflow-hidden flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
          <MapIcon className="w-12 h-12 mb-2 text-gray-400" />
          <p className="text-sm font-medium">생태 탐험 지도</p>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 max-w-[280px]">
              <Lock className="w-8 h-8 text-[#2D6A4F] mx-auto mb-2" />
              <h3 className="font-bold text-gray-900 mb-1">보호종 위치 비공개</h3>
              <p className="text-xs text-gray-500">
                무분별한 서식지 추적을 방지하기 위해 멸종위기종의 상세 위치 데이터와 도감 랭킹 기능은 일반 모드에서 제공되지 않습니다.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowReportModal(true)}
          className="w-full bg-[#2D6A4F] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
        >
          <Camera className="w-5 h-5" />
          주변 생물 제보하기
        </button>

        {showReportModal && (
          <ReportModal onClose={() => setShowReportModal(false)} />
        )}
      </div>
    );
  }

  // Scientist Mode
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 flex flex-col min-h-full relative">
      <AnimatePresence>
        {showRewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            +15 EXP 획득!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[#0f172a] rounded-2xl p-5 text-green-400 shadow-xl border border-slate-800 font-mono relative overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div className="text-[8px] text-slate-500">REC</div>
        </div>
        <h2 className="text-xs text-slate-400 mb-4 flex items-center gap-2">
          <Scan className="w-4 h-4" />
          RADAR ACTIVE
        </h2>
        
        <div className="flex gap-2 mb-6">
          <button 
            onClick={startReport}
            disabled={reportState !== 'idle'}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 p-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            정상 제보 시뮬레이션
          </button>
          <button 
            onClick={startErrorFlow}
            disabled={reportState !== 'idle'}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 p-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            GPS 위조 시뮬레이션
          </button>
        </div>

        <div className="space-y-4 relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {reportState === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                대기 중...
              </motion.div>
            )}

            {(reportState === 'analyzing' || reportState === 'verifying' || reportState === 'securing' || reportState === 'done') && (
              <motion.div key="process" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Step 
                  active={reportState === 'analyzing' || reportState === 'verifying' || reportState === 'securing' || reportState === 'done'}
                  completed={reportState === 'verifying' || reportState === 'securing' || reportState === 'done'}
                  icon={<Scan />}
                  title="1단계: AI 보조 스크리닝"
                  desc="비전 모델 형태학적 유사도 분석 중..."
                />
                <Step 
                  active={reportState === 'verifying' || reportState === 'securing' || reportState === 'done'}
                  completed={reportState === 'securing' || reportState === 'done'}
                  icon={<Users />}
                  title="2단계: 다층형 검증단 필터링"
                  desc="인증된 시민 과학자 3인 블라인드 교차 투표 진행 중..."
                />
                <Step 
                  active={reportState === 'securing' || reportState === 'done'}
                  completed={reportState === 'done'}
                  icon={<ShieldAlert />}
                  title="3단계: 공간 정보 격자화 보안"
                  desc={reportState === 'done' ? "정밀 좌표 마스킹 및 보안 격리 완료." : "좌표 마스킹 및 Security Blur 적용 중..."}
                />
              </motion.div>
            )}

            {reportState === 'error' && (
              <motion.div 
                key="error" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-red-950/50 border border-red-500/50 rounded-xl p-4 text-red-400"
              >
                <div className="flex items-center gap-2 font-bold mb-2 text-red-500">
                  <AlertOctagon className="w-5 h-5" />
                  [⚠️ 메타데이터 원본성 검증 실패]
                </div>
                <p className="text-xs mb-3 leading-relaxed">
                  EXIF 데이터 유실 또는 GPS 위변조가 의심됩니다. 복합 분석 모드를 가동합니다.
                </p>
                <div className="bg-red-900/30 p-2 rounded text-[10px] text-red-300/80">
                  단독 증거로 채택하지 않으며 해당 지역의 기존 생물 출현 이력 및 업로드 유저 신뢰도를 결합하여 알고리즘 복합 판정을 수행합니다.
                </div>
                <button 
                  onClick={() => setReportState('idle')}
                  className="mt-4 w-full bg-red-900/50 py-2 rounded text-xs font-bold hover:bg-red-800/50"
                >
                  초기화
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {reportState === 'done' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleReward}
            className="w-full mt-4 bg-green-500 text-slate-900 font-bold py-3 rounded-lg text-sm"
          >
            데이터 정제 기여 (자원봉사 크레딧 부여)
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Step({ active, completed, icon, title, desc }: { active: boolean, completed: boolean, icon: ReactNode, title: string, desc: string }) {
  if (!active) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-3 items-start p-3 rounded-lg border ${
        completed ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
      }`}
    >
      <div className={`mt-0.5 ${completed ? 'text-green-500' : 'text-blue-400 animate-pulse'}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold mb-1 flex items-center gap-2">
          {title}
          {!completed && <span className="flex gap-0.5">
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>}
        </div>
        <div className="text-xs opacity-80">{desc}</div>
      </div>
    </motion.div>
  )
}
