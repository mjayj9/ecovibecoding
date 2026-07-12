import { UserMode, Report } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle2, XCircle, ChevronRight, Activity, Users, AlertTriangle } from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function HomeTab({ mode }: { mode: UserMode }) {
  const { userData, updateUserData } = useUser();
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

  const handleQuizAnswer = async (correct: boolean) => {
    if (!userData || userData.quizAnswered !== null) return;
    
    let newExp = userData.exp;
    if (correct) {
      newExp = Math.min(100, userData.exp + 30);
    }
    
    await updateUserData({
      quizAnswered: correct,
      exp: newExp
    });
  };

  const exp = userData?.exp ?? 20;
  const quizAnswered = userData?.quizAnswered ?? null;

  if (mode === 'scientist') {
    const totalCount = reports.length;
    const pendingCount = reports.filter(r => r.validationStatus === 'pending' || r.status === 'pending').length;
    const recentFailedReport = reports.find(r => r.validationStatus === 'failed');

    return (
      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#1A365D] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <h2 className="text-sm font-medium text-blue-200 mb-1">국가 생태계 보안 관제</h2>
          <div className="text-2xl font-bold mb-4">대시보드 요약</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3 border border-white/5">
              <Activity className="w-5 h-5 text-blue-300 mb-2" />
              <div className="text-xs text-blue-200">총 제보 건수</div>
              <div className="text-lg font-bold">{totalCount}건</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/5">
              <Users className="w-5 h-5 text-blue-300 mb-2" />
              <div className="text-xs text-blue-200">검증 대기 건수</div>
              <div className="text-lg font-bold">{pendingCount}건</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-[#1A365D] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E67E22]" />
            최근 보안 경고
          </h3>
          {recentFailedReport ? (
            <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm flex items-start gap-3">
              <div className="bg-red-50 p-2 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">메타데이터 원본성 검증 실패</div>
                <div className="text-xs text-gray-500 mt-1">
                  제보자 '{recentFailedReport.userName}'님의 '{recentFailedReport.title}' 데이터에서 위치 메타데이터가 유실되거나 위변조되었습니다.
                </div>
                <div className="text-[10px] text-gray-400 mt-2">
                  {new Date(recentFailedReport.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-sm text-gray-500 py-4">현재 감지된 위조 의심 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* EXP Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="text-xs font-bold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-1 rounded-md inline-block mb-1">
              Lv.1 일반대원
            </div>
            <h2 className="text-xl font-bold text-gray-900">생태 탐험가</h2>
          </div>
          <div className="text-sm font-medium text-gray-500">{exp}/100 EXP</div>
        </div>
        
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#40916C]"
            initial={{ width: 0 }}
            animate={{ width: `${exp}%` }}
            transition={{ duration: 1, type: "spring" }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <Shield className="absolute -right-4 -top-4 w-24 h-24 text-white/5 transform rotate-12" />
        
        <div className="relative z-10">
          <div className="text-xs font-bold text-green-200 tracking-wider mb-2">오늘의 생태 퀴즈</div>
          <h3 className="text-lg font-bold mb-4 leading-snug">
            수달(보호종)과 뉴트리아(외래종)를 형태학적으로 구별하는 가장 확실한 기준은 무엇일까요?
          </h3>

          <div className="space-y-3">
            <button 
              onClick={() => handleQuizAnswer(false)}
              disabled={quizAnswered !== null}
              className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${
                quizAnswered === false ? 'bg-red-500/20 border-red-400' : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-sm font-medium">크기 (몸집)</span>
              {quizAnswered === false && <XCircle className="w-5 h-5 text-red-400" />}
            </button>
            
            <button 
              onClick={() => handleQuizAnswer(true)}
              disabled={quizAnswered !== null}
              className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${
                quizAnswered === true ? 'bg-green-500/40 border-green-300' : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <span className="text-sm font-medium">꼬리의 모양 (납작함 vs 둥긂)</span>
              {quizAnswered === true && <CheckCircle2 className="w-5 h-5 text-green-300" />}
            </button>
          </div>

          <AnimatePresence>
            {quizAnswered !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                className="bg-white/10 rounded-xl p-4 text-sm"
              >
                {quizAnswered ? (
                  <p className="text-green-100"><strong className="text-white">정답입니다!</strong> 수달은 꼬리가 둥글고 굵은 반면, 뉴트리아는 쥐처럼 가늘고 둥근 꼬리를 가졌습니다. +30 EXP 획득!</p>
                ) : (
                  <p className="text-orange-100">아쉽네요. 크기도 다르지만, 개체에 따라 비슷할 수 있어요. <strong>꼬리의 모양</strong>이 가장 확실한 구별법이랍니다.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
