
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
