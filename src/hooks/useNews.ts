
import { useState, useEffect } from "react";
import { Article } from "@/types/news";

// Mock data for the news articles
const mockArticles: Article[] = [
  {
    id: "1",
    title: "New Research Shows Benefits of Remote Work on Mental Health",
    content: "A recent study conducted by the University of California has found that remote work reduces stress levels by 28% on average. Researchers followed 500 participants over a six-month period and measured various health indicators. The study also noted improved sleep quality and reduced commute-related anxiety among remote workers.",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2940&fit=crop&auto=format",
    publishedAt: "2025-04-11T10:30:00Z",
    source: "Health Today",
    category: "health",
    author: "Dr. Sarah Johnson",
    likes: 156,
    comments: 24
  },
  {
    id: "2",
    title: "Tech Giants Announce Joint Initiative for Climate Change",
    content: "Google, Microsoft, and Amazon have partnered to launch a $2 billion fund aimed at developing sustainable technologies. The initiative will focus on carbon capture, renewable energy storage, and eco-friendly manufacturing processes. The companies have pledged to make all their operations carbon-neutral by 2030.",
    imageUrl: "https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?q=80&w=2940&fit=crop&auto=format",
    publishedAt: "2025-04-10T14:15:00Z",
    source: "Tech Journal",
    category: "technology",
    author: "Michael Chen",
    likes: 243,
    comments: 57
  },
  {
    id: "3",
    title: "Global Tourism Expected to Reach Pre-Pandemic Levels by 2026",
    content: "According to a report by the World Tourism Organization, international travel is recovering steadily but will take another year to fully bounce back. Asia-Pacific regions are showing the slowest recovery, while Europe and North America are leading the return to normal tourism patterns. The report highlights the importance of sustainable tourism practices as travel resumes.",
    imageUrl: "https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2831&fit=crop&auto=format",
    publishedAt: "2025-04-09T09:45:00Z",
    source: "Travel & Leisure",
    category: "travel",
    author: "Emma Rodriguez",
    likes: 89,
    comments: 12
  },
  {
    id: "4",
    title: "Stock Markets Hit New Records as Inflation Stabilizes",
    content: "Major stock indices reached all-time highs yesterday as the latest economic data showed inflation rates stabilizing across developed economies. The S&P 500 climbed 1.2%, while the NASDAQ gained 1.8%. Analysts attribute the rally to decreased fears of aggressive interest rate hikes and strong corporate earnings reports.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2940&fit=crop&auto=format",
    publishedAt: "2025-04-08T16:20:00Z",
    source: "Financial Times",
    category: "finance",
    author: "Robert Miller",
    likes: 178,
    comments: 45
  },
  {
    id: "5",
    title: "New Breakthrough in Alzheimer's Treatment Shows Promise",
    content: "Scientists at Johns Hopkins University have developed a new drug that significantly slows the progression of Alzheimer's disease in early clinical trials. The treatment targets specific proteins associated with cognitive decline and has shown minimal side effects. While still in phase II trials, researchers are optimistic about potential approval within the next three years.",
    publishedAt: "2025-04-07T11:10:00Z",
    source: "Medical News",
    category: "health",
    author: "Dr. Lisa Patel",
    likes: 312,
    comments: 67
  },
  {
    id: "6",
    title: "New Sports League Announces Expansion to Six More Cities",
    content: "The National Urban Sports League has announced plans to add six new franchises over the next two years. The expansion will include teams in Austin, Portland, Nashville, Charlotte, Pittsburgh, and San Diego. The league has seen rapid growth in viewership since its inception three years ago, particularly among younger demographics.",
    imageUrl: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=2796&fit=crop&auto=format",
    publishedAt: "2025-04-06T13:45:00Z",
    source: "Sports Network",
    category: "sports",
    author: "Jason Thompson",
    likes: 134,
    comments: 89
  }
];

export const useNews = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Extract unique categories from the articles
  const categories = Array.from(
    new Set(mockArticles.map(article => article.category).filter(Boolean) as string[])
  );

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      if (activeCategory === "all") {
        setNews(mockArticles);
      } else {
        setNews(mockArticles.filter(article => article.category === activeCategory));
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeCategory]);

  return {
    news,
    isLoading,
    categories,
    activeCategory,
    setActiveCategory
  };
};
