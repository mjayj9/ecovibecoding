/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserMode, Tab } from './types';
import { HomeTab } from './components/tabs/HomeTab';
import { MapTab } from './components/tabs/MapTab';
import { NewsTab } from './components/tabs/NewsTab';
import { MyTab } from './components/tabs/MyTab';
import { BottomNav } from './components/BottomNav';
import { TopBar } from './components/TopBar';
import { UserProvider, useUser } from './hooks/useUser';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

function MainApp() {
  const [mode, setMode] = useState<UserMode>('general');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { user, loading } = useUser();

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

  return (
    <div className="mx-auto w-full max-w-[430px] min-h-screen h-screen overflow-hidden bg-[#F3F4F6] flex flex-col relative shadow-2xl sm:border sm:border-gray-200">
      <TopBar mode={mode} setMode={setMode} />
      
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

