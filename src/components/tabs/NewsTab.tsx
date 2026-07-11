import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

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

export function NewsTab() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch from backend api');
        const data = await response.json();
        
        if (data.fallback) {
          setIsFallback(true);
        }

        if (data.articles && data.articles.length > 0) {
          setNews(data.articles);
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

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-[#1A365D]">생태 뉴스 피드</h2>
        {isFallback && (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            백업 모드
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
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
