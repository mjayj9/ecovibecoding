import { useState, useEffect } from 'react';
import { UserMode, Report } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, AlertOctagon, Scan, ShieldAlert, Map as MapIcon, Lock } from 'lucide-react';
import { ReportModal } from '../ReportModal';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function MapTab({ mode }: { mode: UserMode }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (mode !== 'scientist') return;

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(data);
    });

    return () => unsubscribe();
  }, [mode]);

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
    <div className="p-4 space-y-4 animate-in fade-in duration-500 flex flex-col min-h-full relative pb-24">
      <div className="bg-[#0f172a] rounded-2xl p-5 text-green-400 shadow-xl border border-slate-800 font-mono relative overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div className="text-[8px] text-slate-500">LIVE</div>
        </div>
        <h2 className="text-xs text-slate-400 mb-4 flex items-center gap-2">
          <Scan className="w-4 h-4" />
          보안 관제 레이더
        </h2>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {reports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">수신된 제보가 없습니다.</div>
          ) : (
            <AnimatePresence>
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl border ${
                    report.validationStatus === 'failed' 
                      ? 'bg-red-950/30 border-red-900/50 text-red-200' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-white">{report.title}</h3>
                    <span className="text-[10px] opacity-50">
                      {new Date(report.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-2 items-start">
                    {report.photoUrl && (
                      <div className="w-16 h-16 rounded-lg bg-black/50 border border-white/10 shrink-0 overflow-hidden">
                        <img src={report.photoUrl} alt="report" className="w-full h-full object-cover opacity-70" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-80 line-clamp-2 mb-2">{report.description}</p>
                      <div className="flex flex-col gap-1">
                        {report.validationStatus === 'failed' ? (
                          <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-1 rounded w-fit">
                            <AlertOctagon className="w-3 h-3" />
                            메타데이터 유실 / 위조 의심
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded w-fit">
                            <ShieldAlert className="w-3 h-3" />
                            위치 검증 완료
                          </div>
                        )}
                        <div className="text-[10px] font-mono opacity-50">
                          {report.deviceLocation?.lat.toFixed(4)}, {report.deviceLocation?.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
