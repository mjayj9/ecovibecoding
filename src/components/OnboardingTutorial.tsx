import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Camera, ShieldCheck, ChevronRight } from 'lucide-react';
import { useUser } from '../hooks/useUser';

const SLIDES = [
  {
    id: 1,
    icon: <Leaf className="w-16 h-16 text-[#2D6A4F]" />,
    title: "Eco-Tech Guardian에\n오신 것을 환영합니다!",
    description: "당신의 제보가 생태계를 지킵니다.\n시민 과학자로서 첫 걸음을 내딛어 보세요."
  },
  {
    id: 2,
    icon: <Camera className="w-16 h-16 text-[#2D6A4F]" />,
    title: "주변의 야생 생물을 발견하면\n사진을 찍어 제보해주세요.",
    description: "위치(GPS)는 사진에서 자동으로 추출됩니다!\n번거로운 위치 입력 없이 쉽게 제보하세요."
  },
  {
    id: 3,
    icon: <ShieldCheck className="w-16 h-16 text-[#2D6A4F]" />,
    title: "보안과 보상이\n함께합니다.",
    description: "서식지 보호를 위해 위치는 비공개 처리되며,\n활동을 통해 EXP를 얻고 성장해보세요!"
  }
];

export function OnboardingTutorial() {
  const { updateUserData } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [finishing, setFinishing] = useState(false);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setFinishing(true);
      await updateUserData({ hasSeenTutorial: true });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[430px] min-h-screen bg-[#F3F4F6] flex flex-col relative overflow-hidden shadow-2xl sm:border sm:border-gray-200 z-50">
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center max-w-sm w-full"
          >
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
              {SLIDES[currentSlide].icon}
            </div>
            <h1 className="text-2xl font-bold text-[#1B4332] mb-4 whitespace-pre-line leading-tight">
              {SLIDES[currentSlide].title}
            </h1>
            <p className="text-gray-500 whitespace-pre-line text-sm leading-relaxed">
              {SLIDES[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 pb-12 flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-[#2D6A4F]' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={finishing}
          className="w-full max-w-sm bg-[#2D6A4F] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          {currentSlide === SLIDES.length - 1 ? (
            finishing ? '준비 중...' : '시작하기'
          ) : (
            <>
              다음 <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
