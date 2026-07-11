import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const FALLBACK_NEWS = [
  {
    title: "CCTV에 찍힌 수달, 알고 보니 외래종 뉴트리아? 오인 신고로 인한 행정력 낭비 막으려면 앱 내 교육 필수",
    source: { name: "생태수호일보" },
    publishedAt: new Date().toISOString()
  },
  {
    title: "SNS 타고 번진 희귀종 서식지 위치 정보... 밀려드는 탐방객에 몸살 앓는 야생 서식지들",
    source: { name: "환경저널" },
    publishedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    title: "메타데이터 위조된 불법 채집 사진 차단 기술 도입, 깨끗한 시민 과학 플랫폼 구축 앞장",
    source: { name: "테크에코" },
    publishedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/news", async (req, res) => {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
        throw new Error("NEWS_API_KEY is not defined in environment variables.");
      }
      
      const response = await fetch(`https://newsapi.org/v2/everything?q=생태+OR+환경&language=ko&apiKey=${apiKey}`, {
        headers: {
          'User-Agent': 'Eco-Tech-Guardian/1.0'
        }
      });
      if (!response.ok) {
        throw new Error('NewsAPI limit reached or blocked');
      }
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        res.json({ fallback: false, articles: data.articles.slice(0, 5) });
      } else {
        throw new Error('No articles found');
      }
    } catch (error) {
      console.log("News API fetch bypassed, using fallback data.");
      res.json({ fallback: true, articles: FALLBACK_NEWS });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
