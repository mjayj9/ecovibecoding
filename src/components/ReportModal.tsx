import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUser } from '../hooks/useUser';
import { Location } from '../types';
import exifr from 'exifr';

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
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [exifLocation, setExifLocation] = useState<Location | null>(null);
  const [validationStatus, setValidationStatus] = useState<'passed' | 'failed' | 'pending'>('pending');
  const [loadingExif, setLoadingExif] = useState(false);

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

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLoadingExif(true);
    try {
      const gps = await exifr.gps(file);
      if (gps && gps.latitude && gps.longitude) {
        setExifLocation({ lat: gps.latitude, lng: gps.longitude });
        setValidationStatus('passed');
      } else {
        setExifLocation(null);
        setValidationStatus('failed');
      }
    } catch (err) {
      console.error('EXIF extraction error:', err);
      setExifLocation(null);
      setValidationStatus('failed');
    } finally {
      setLoadingExif(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !location || !title.trim() || !description.trim() || !photoUrl) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reports'), {
        userId: user.uid,
        userName: userData?.name || user.displayName || '익명 대원',
        title,
        description,
        photoUrl,
        exifLocation,
        deviceLocation: location,
        validationStatus,
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
                  <label className="text-xs font-bold text-gray-500">사진 첨부 (필수)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    <div className={`w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${photoUrl ? 'border-transparent overflow-hidden p-0' : 'border-gray-300 bg-gray-50'} transition-all`}>
                      {photoUrl ? (
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                          <span className="text-xs text-gray-500">사진 촬영 또는 업로드</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-1">
                    💡 팁: 카메라 앱으로 직접 촬영한 사진을 올리면 GPS 메타데이터가 정확하게 인식됩니다. 카카오톡 등으로 다운로드한 사진은 위치 정보가 유실될 수 있습니다.
                  </p>
                  
                  {photoFile && (
                    <div className="mt-2 text-xs font-bold p-2 rounded-lg bg-gray-50">
                      {loadingExif ? (
                        <span className="text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> EXIF 데이터 분석 중...</span>
                      ) : validationStatus === 'passed' ? (
                        <span className="text-green-600">✅ 1차 검증 통과: 사진 위치 정보가 확인되었습니다.</span>
                      ) : (
                        <span className="text-red-500">❌ 1차 검증 실패: 사진에 위치 메타데이터가 없습니다. 제보 신뢰도가 하락합니다.</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">생물명</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 길고양이, 청둥오리, 수달 (모르면 '모름'이라고 적어주세요)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">생물 설명</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="발견 당시의 상황이나 생물의 상태를 간단히 적어주세요. (예: 다리를 절고 있어요, 혼자 있어요)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-all resize-none h-28"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || loadingLocation || !location || !title.trim() || !description.trim() || !photoUrl}
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
