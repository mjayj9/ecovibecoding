import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/news", async (req, res) => {
    try {
      const apiKey = process.env.NEWSDATA_API_KEY;
      if (!apiKey) {
        throw new Error("NEWSDATA_API_KEY is not defined in environment variables.");
      }
      
      const query = encodeURIComponent('멸종위기종 OR 멸종위기 OR 보호종 OR "endangered species"');
      const response = await fetch(`https://newsdata.io/api/1/news?apikey=${apiKey}&q=${query}&language=ko,en`);
      if (!response.ok) {
        throw new Error('NewsData API limit reached or blocked');
      }
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        res.json({ fallback: false, articles: data.results.slice(0, 5) });
      } else {
        console.log("No articles found for the query, using fallback data.");
        res.json({ fallback: true, articles: FALLBACK_NEWS });
      }
    } catch (error: any) {
      console.log("News API fetch bypassed, using fallback data. Reason:", error.message);
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
