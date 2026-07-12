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
import { UserProvider, useUser } from './hooks/useUser';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion } from 'motion/react';
import { Leaf, Microscope } from 'lucide-react';

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
  const { user, userData, loading } = useUser();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error', error);
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
          className="bg-[#2D6A4F] text-white px-8 py-3 rounded-xl font-medium shadow-lg active:scale-95 transition-transform"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (user && userData && !userData.role) {
    return <RoleSelectionScreen />;
  }

  const mode = userData?.role || 'general';

  return (
    <div className="mx-auto w-full max-w-[430px] min-h-screen h-screen overflow-hidden bg-[#F3F4F6] flex flex-col relative shadow-2xl sm:border sm:border-gray-200">
      <TopBar />
      
      <main className="flex-1 overflow-y-auto pb-20 relative">
        {activeTab === 'home' && <HomeTab mode={mode} />}
        {activeTab === 'map' && <MapTab mode={mode} />}
        {activeTab === 'news' && <NewsTab />}
        {activeTab === 'my' && <MyTab mode={mode} user={user} />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

