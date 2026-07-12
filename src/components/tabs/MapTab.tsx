import { useState, useEffect } from 'react';
import { UserMode, Report } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, AlertOctagon, Scan, ShieldAlert, Map as MapIcon, Lock, Check, X } from 'lucide-react';
import { ReportModal } from '../ReportModal';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

export function MapTab({ mode }: { mode: UserMode }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [showTooltip, setShowTooltip] = useState(() => {
    return localStorage.getItem('hasSeenReportTooltip') !== 'true';
  });

  useEffect(() => {
    if (mode !== 'scientist') return;

    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
      setReports(data);
    });

    return () => unsubscribe();
  }, [mode]);

  const handleVerify = async (reportId: string, isApproved: boolean) => {
    if (!reportId) return;
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        validationStatus: isApproved ? 'verified' : 'rejected',
        status: isApproved ? 'verified' : 'rejected'
      });
      toast.success('검증 처리가 완료되었습니다.');
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('검증 처리 중 오류가 발생했습니다.');
    }
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

        <div className="relative mt-4">
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#E67E22] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center whitespace-nowrap z-10"
              >
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center gap-1"
                >
                  👋 첫 생물 제보를 시작해보세요!
                </motion.div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#E67E22] rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => {
              if (showTooltip) {
                setShowTooltip(false);
                localStorage.setItem('hasSeenReportTooltip', 'true');
              }
              setShowReportModal(true);
            }}
            className="w-full bg-[#2D6A4F] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <Camera className="w-5 h-5" />
            주변 생물 제보하기
          </button>
        </div>

        {showReportModal && (
          <ReportModal onClose={() => setShowReportModal(false)} />
        )}
      </div>
    );
  }

  // Scientist Mode
  const displayReports = reports.filter(r => r.validationStatus === 'pending' || r.status === 'pending');

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 flex flex-col min-h-full relative pb-24">
      <div className="bg-[#0f172a] rounded-2xl p-5 text-green-400 shadow-xl border border-slate-800 font-mono relative overflow-hidden flex flex-col h-full max-h-[80vh]">
        <div className="absolute top-2 right-2 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <div className="text-[8px] text-slate-500">LIVE</div>
        </div>
        <h2 className="text-xs text-slate-400 mb-4 flex items-center gap-2 shrink-0">
          <Scan className="w-4 h-4" />
          미검증 제보 리스트 관제
        </h2>
        
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {displayReports.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">대기 중인 제보가 없습니다.</div>
          ) : (
            <AnimatePresence>
              {displayReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl border bg-slate-900/80 border-slate-700 text-slate-300 shadow-lg flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-white">{report.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">제보자: {report.userName}</p>
                    </div>
                    <span className="text-[10px] opacity-50 whitespace-nowrap ml-2">
                      {new Date(report.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    {report.photoUrl ? (
                      <div className="w-20 h-20 rounded-lg bg-black/50 border border-white/10 shrink-0 overflow-hidden">
                        <img src={report.photoUrl} alt="report" className="w-full h-full object-cover opacity-90" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        <Camera className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-90 line-clamp-3 leading-relaxed">{report.description}</p>
                      
                      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <MapIcon className="w-3 h-3" />
                        {report.deviceLocation?.lat.toFixed(4)}, {report.deviceLocation?.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleVerify(report.id!, true)}
                      className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                    >
                      <Check className="w-3 h-3" />
                      승인
                    </button>
                    <button
                      onClick={() => handleVerify(report.id!, false)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors active:scale-95"
                    >
                      <X className="w-3 h-3" />
                      반려
                    </button>
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
