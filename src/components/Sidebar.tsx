import { motion, AnimatePresence } from 'motion/react';
import { Home, Map, Newspaper, Settings, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { Tab } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: Tab) => void;
}

export function Sidebar({ isOpen, onClose, setActiveTab }: SidebarProps) {
  const { user, userData } = useUser();
  const role = userData?.role || 'general';

  const handleNavigate = (tab: Tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header / Profile */}
            <div className="bg-[#1B4332] text-white p-6 pt-10 pb-8 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 opacity-10 translate-x-1/3 -translate-y-1/4">
                {role === 'general' ? <ShieldCheck className="w-48 h-48" /> : <ShieldAlert className="w-48 h-48" />}
              </div>
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full transition-colors active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10 flex items-center gap-4">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-14 h-14 rounded-full border-2 border-white/20 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20 shadow-lg">
                    <span className="text-xl font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-lg">{user?.displayName || '대원'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === 'general' ? 'bg-[#2D6A4F] text-white' : 'bg-[#E67E22] text-white'}`}>
                      {role === 'general' ? '일반 대원' : '시민 과학자'}
                    </span>
                    <span className="text-xs text-white/80 font-mono">
                      Lv.{userData?.level || 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="space-y-6">
                {/* Home */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="flex items-center gap-3 w-full p-2 text-left font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="bg-green-100 p-2 rounded-lg text-green-700">
                      <Home className="w-5 h-5" />
                    </div>
                    {role === 'general' ? '홈' : '관제 센터'}
                  </button>
                  <ul className="pl-14 space-y-3 text-sm text-gray-500">
                    {role === 'general' ? (
                      <>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">나의 활동 통계</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">오늘의 생태 퀴즈</li>
                      </>
                    ) : (
                      <>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">국가 생태 관제 대시보드</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">실시간 통계</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Map */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigate('map')}
                    className="flex items-center gap-3 w-full p-2 text-left font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                      <Map className="w-5 h-5" />
                    </div>
                    {role === 'general' ? '생태 탐험' : '데이터 검증'}
                  </button>
                  <ul className="pl-14 space-y-3 text-sm text-gray-500">
                    {role === 'general' ? (
                      <>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">위치 기반 제보하기</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">서식지 보호 가이드</li>
                      </>
                    ) : (
                      <>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">미검증 제보 관제</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">이미지 1차 판독</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">승인 및 반려 처리</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* News */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigate('news')}
                    className="flex items-center gap-3 w-full p-2 text-left font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    소식통
                  </button>
                  <ul className="pl-14 space-y-3 text-sm text-gray-500">
                    <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">최신 환경 뉴스 피드</li>
                  </ul>
                </div>

                {/* My */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleNavigate('my')}
                    className="flex items-center gap-3 w-full p-2 text-left font-bold text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                      <Settings className="w-5 h-5" />
                    </div>
                    {role === 'general' ? '내 정보' : '설정'}
                  </button>
                  <ul className="pl-14 space-y-3 text-sm text-gray-500">
                    {role === 'general' ? (
                      <>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">안전 수칙 서약</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">증서 발급</li>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">역할 변경</li>
                      </>
                    ) : (
                      <>
                        <li className="relative before:content-[''] before:absolute before:-left-4 before:top-2 before:w-2 before:h-[1px] before:bg-gray-300">권한 및 역할 관리</li>
                      </>
                    )}
                  </ul>
                </div>
              </nav>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <div className="text-center text-[10px] text-gray-400 font-mono">
                Eco-Tech Guardian v1.0
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
