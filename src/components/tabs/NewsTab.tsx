import { useState, useEffect } from 'react';
import { Newspaper, AlertCircle, Settings, RefreshCw, Key, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FALLBACK_NEWS = [
  {
    title: "CCTV에 찍힌 수달, 알고 보니 외래종 뉴트리아? 오인 신고로 인한 행정력 낭비 막으려면 앱 내 교육 필수",
    source_id: "생태수호일보",
    link: "#",
    pubDate: new Date().toISOString()
  },
  {
    title: "SNS 타고 번진 희귀종 서식지 위치 정보... 밀려드는 탐방객에 몸살 앓는 야생 서식지들",
    source_id: "환경저널",
    link: "#",
    pubDate: new Date(Date.now() - 86400000).toISOString()
  },
  {
    title: "메타데이터 위조된 불법 채집 사진 차단 기술 도입, 깨끗한 시민 과학 플랫폼 구축 앞장",
    source_id: "테크에코",
    link: "#",
    pubDate: new Date(Date.now() - 172800000).toISOString()
  }
];

interface NewsItem {
  title: string;
  link: string;
  source_id?: string;
  pubDate?: string;
  image_url?: string;
}

const CACHE_KEY = 'eco_news_cache';
const CACHE_DURATION = 86400000; // 24 hours in ms

export function NewsTab() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  // BYOK State
  const [showSettings, setShowSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // 1. Check Cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { timestamp, articles } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setNews(articles);
            setLoading(false);
            return;
          }
        }

        // 2. Fetch from backend if cache missed or expired
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch from backend api');
        const data = await response.json();
        
        if (data.fallback) {
          setIsFallback(true);
        }

        if (data.articles && data.articles.length > 0) {
          setNews(data.articles);
          
          // 3. Save to Cache
          if (!data.fallback) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              articles: data.articles
            }));
          }
        } else {
          throw new Error('No articles found');
        }
      } catch (error) {
        console.warn('NewsAPI fetch failed, falling back to backup data:', error);
        setNews(FALLBACK_NEWS);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleCustomFetch = async () => {
    if (!customApiKey.trim()) return;
    
    setCustomLoading(true);
    setLoading(true); // Show skeleton for the whole list
    setCustomError(null);
    setCustomSuccess(false);

    try {
      const query = encodeURIComponent('멸종위기종 OR 멸종위기 OR 보호종 OR "endangered species"');
      const response = await fetch(`https://newsdata.io/api/1/news?apikey=${customApiKey.trim()}&q=${query}&language=ko,en`);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('유효하지 않은 API 키이거나 할당량을 초과했습니다.');
        }
        throw new Error(`API 요청 실패 (${response.status})`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setNews(data.results.slice(0, 5));
        setIsFallback(false);
        setCustomSuccess(true);
      } else {
        throw new Error('검색된 최신 뉴스가 없습니다.');
      }
    } catch (err: any) {
      setCustomError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setCustomLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#1A365D]">생태 뉴스 피드</h2>
          {isFallback && (
            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              백업 모드
            </span>
          )}
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors active:scale-95"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#1A365D] p-4 rounded-xl shadow-inner text-white mb-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-200 mb-1">
                <Key className="w-4 h-4" />
                더 많은 최신 뉴스 불러오기 (파워 유저용)
              </div>
              <p className="text-xs text-blue-100/70 mb-2">
                할당량 제한 없이 실시간 최신 뉴스를 받아보려면 NewsData.io API 키를 직접 입력하세요.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="NewsData.io API Key"
                  className="flex-1 bg-white/10 border border-blue-400/30 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                />
                <button
                  onClick={handleCustomFetch}
                  disabled={customLoading || !customApiKey.trim()}
                  className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] active:scale-95"
                >
                  {customLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {customError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium text-red-400 flex items-center gap-1 mt-2"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {customError}
                  </motion.div>
                )}
                {customSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium text-green-400 flex items-center gap-1 mt-2"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    개인 API 키를 이용해 최신 뉴스를 로드했습니다.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse flex flex-col gap-3">
              <div className="h-5 bg-gray-200 rounded-md w-full" />
              <div className="h-5 bg-gray-200 rounded-md w-3/4" />
              <div className="w-full h-32 bg-gray-100 rounded-lg mt-1" />
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item, index) => (
            <motion.a
              href={item.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 group active:bg-gray-50 hover:bg-gray-50 transition-colors block"
            >
              <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 group-active:text-[#2D6A4F] group-hover:text-[#2D6A4F] transition-colors">
                {item.title}
              </h3>
              {item.image_url && (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1B4332] bg-[#2D6A4F]/10 px-2 py-0.5 rounded">
                    {item.source_id || "알 수 없음"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {item.pubDate ? new Date(item.pubDate).toLocaleDateString('ko-KR') : ""}
                  </span>
                </div>
                <Newspaper className="w-4 h-4 text-gray-300 group-hover:text-[#2D6A4F] transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}
