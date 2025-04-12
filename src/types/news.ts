
export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  sourceUrl?: string;
  category?: string;
  author?: string;
  likes: number;
  comments: number;
  bookmarked?: boolean;
}
