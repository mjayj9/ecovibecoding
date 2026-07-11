import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from '../hooks/useUser';
import { Location } from '../types';

interface ReportModalProps {
  onClose: () => void;
}

export function ReportModal({ onClose }: ReportModalProps) {
  const { user, userData } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('브라우저가 위치 정보를 지원하지 않습니다.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('위치 권한을 허용해주세요.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !location || !title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userName: userData?.name || user.displayName || '익명 대원',
        title,
        location,
        description,
        createdAt: Date.now(),
        status: 'pending'
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error adding report:', error);
      alert('제보 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={success ? undefined : onClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-gray-100"
        >
          {success ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">제보 완료!</h2>
              <p className="text-sm text-gray-500">생태계 보호에 기여해주셔서 감사합니다.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-900">주변 생물 제보하기</h2>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#2D6A4F]" />
                    <span className="text-sm font-bold text-gray-700">현재 위치</span>
                  </div>
                  {loadingLocation ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      위치 확인 중...
                    </div>
                  ) : locationError ? (
                    <div className="space-y-2">
                      <div className="text-xs text-red-500">{locationError}</div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setLocation({ lat: 37.5665, lng: 126.9780 });
                          setLocationError(null);
                        }}
                        className="text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg transition-colors font-bold"
                      >
                        가상 위치로 테스트하기 (서울)
                      </button>
                    </div>
                  ) : location ? (
                    <div className="text-xs text-gray-600 font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">생물명</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 수달, 청둥오리 등"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">생물 설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="어떤 생물을 발견하셨나요? 특징을 자세히 적어주세요."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all resize-none h-28"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || loadingLocation || !location || !title.trim() || !description.trim()}
                  className="w-full bg-[#2D6A4F] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '제보하기'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
