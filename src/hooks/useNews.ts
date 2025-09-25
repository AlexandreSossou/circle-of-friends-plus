import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  videoUrl?: string;
  contentType?: 'article' | 'video';
  duration?: number;
  publishedAt: string;
  source: string;
  sourceUrl?: string;
  category?: string;
  author?: string;
  likes: number;
  comments: number;
  bookmarked?: boolean;
}

export const useNews = () => {
  const [news, setNews] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchNews = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('news_articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news:', error);
        setNews([]);
        return;
      }

      // Transform data to match Article interface
      const articles: Article[] = (data || []).map(article => ({
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary || undefined,
        imageUrl: article.image_url || undefined,
        videoUrl: article.video_url || undefined,
        contentType: (article.content_type as 'article' | 'video') || 'article',
        duration: article.duration || undefined,
        publishedAt: article.published_at,
        source: article.source,
        sourceUrl: article.source_url || undefined,
        category: article.category || undefined,
        author: article.author_name || undefined,
        likes: 0, // These would come from a separate likes table
        comments: 0, // These would come from a separate comments table
        bookmarked: false
      }));

      setNews(articles);

      // Get unique categories
      const uniqueCategories = Array.from(
        new Set(articles.map(article => article.category).filter(Boolean))
      );
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  const refetch = () => {
    fetchNews();
  };

  return {
    news,
    isLoading,
    categories,
    activeCategory,
    setActiveCategory,
    refetch
  };
};