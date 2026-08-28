/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Tab } from './types';
import { HomeTab } from './components/tabs/HomeTab';
import { MapTab } from './components/tabs/MapTab';
import { NewsTab } from './components/tabs/NewsTab';
import { MyTab } from './components/tabs/MyTab';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { UserProvider, useUser } from './hooks/useUser';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion } from 'motion/react';
import { Leaf, Microscope } from 'lucide-react';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { Toaster, toast } from 'react-hot-toast';

function RoleSelectionScreen() {
  const { updateUserData } = useUser();
  const [selecting, setSelecting] = useState(false);

  const handleSelect = async (role: 'general' | 'scientist') => {
    setSelecting(true);
    await updateUserData({ role });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="mx-auto w-full max-w-[430px] min-h-screen bg-[#F3F4F6] flex flex-col p-6 items-center justify-center relative overflow-hidden shadow-2xl sm:border sm:border-gray-200"
    >
      <div className="z-10 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#1B4332] mb-2 text-center">역할을 선택해주세요</h1>
        <p className="text-gray-500 text-sm text-center mb-8">안전한 생태계 데이터 구축을 위해<br/>첫 가입 시 1회만 선택 가능합니다.</p>
        
        <div className="space-y-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('general')}
            disabled={selecting}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center gap-3 text-center transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-[#2D6A4F]" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">🌱 일반 탐험가 (시민)</div>
              <div className="text-xs text-gray-500 mt-1">생태 퀴즈를 풀고 가벼운 생태 탐험을 즐깁니다.</div>
            </div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('scientist')}
            disabled={selecting}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-center gap-3 text-center transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Microscope className="w-8 h-8 text-[#1A365D]" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">🔬 생태 연구원 (과학자)</div>
              <div className="text-xs text-gray-500 mt-1">제보된 데이터를 검증하고 국가 데이터셋을 보호합니다.</div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, userData, loading } = useUser();

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login error', error);
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        toast.error('로그인 팝업이 닫혔습니다. 다시 시도해 주세요.');
      } else if (code === 'auth/unauthorized-domain') {
        toast.error('승인되지 않은 도메인입니다. Firebase 콘솔에서 현재 도메인을 추가해 주세요.');
      } else if (code === 'auth/operation-not-allowed') {
        toast.error('Google 로그인 기능이 비활성화되어 있습니다. Firebase 콘솔을 확인해 주세요.');
      } else if (code === 'auth/popup-blocked') {
        toast.error('브라우저의 팝업 차단을 해제해 주세요.');
      } else {
        toast.error(`로그인 실패: ${error?.message || '알 수 없는 에러가 발생했습니다.'}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="animate-pulse text-[#1B4332] font-semibold text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-[#1B4332] mb-2 tracking-tight">Eco-Tech Guardian</h1>
        <p className="text-[#1A365D] mb-8 text-sm">Join the mission to protect our ecosystem.</p>
        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="bg-[#2D6A4F] text-white px-8 py-3 rounded-xl font-medium shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              구글 계정으로 로그인 중...
            </>
          ) : (
            'Sign in with Google'
          )}
        </button>
      </div>
    );
  }

  if (user && userData && !userData.role) {
    return <RoleSelectionScreen />;
  }

  if (user && userData && userData.role && !userData.hasSeenTutorial) {
    return <OnboardingTutorial />;
  }

  const mode = userData?.role || 'general';

  return (
    <>
      <div className="mx-auto w-full max-w-[430px] min-h-screen h-screen overflow-hidden bg-[#F3F4F6] flex flex-col relative shadow-2xl sm:border sm:border-gray-200">
        <TopBar onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto pb-20 relative">
          {activeTab === 'home' && <HomeTab mode={mode} />}
          {activeTab === 'map' && <MapTab mode={mode} />}
          {activeTab === 'news' && <NewsTab />}
          {activeTab === 'my' && <MyTab mode={mode} user={user} />}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userData={userData}
      />
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Toaster position="top-center" />
      <MainApp />
    </UserProvider>
  );
}

