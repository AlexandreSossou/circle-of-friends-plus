import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNews } from "@/hooks/useNews";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function NewsPreview() {
  const { news, isLoading } = useNews();
  
  // Get the 3 most recent articles
  const recentNews = news.slice(0, 3);

  if (isLoading) {
    return (
      <div className="social-card p-4">
        <h3 className="font-semibold mb-3">Latest News</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-social-gray rounded mb-2"></div>
              <div className="h-3 bg-social-gray rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="social-card p-4">
      <h3 className="font-semibold mb-3">Latest News</h3>
      <div className="space-y-3">
        {recentNews.length > 0 ? (
          recentNews.map((article) => (
            <div key={article.id} className="border-l-2 border-social-blue pl-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2 leading-tight">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {article.category && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {article.category}
                      </Badge>
                    )}
                    <span className="text-xs text-social-textSecondary">
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                  {article.summary && (
                    <p className="text-xs text-social-textSecondary mt-1 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>
                {article.imageUrl && (
                  <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-social-textSecondary">No news available</p>
        )}
      </div>
      <Link 
        to="/news" 
        className="flex items-center justify-between mt-3 text-social-blue text-sm font-medium hover:underline"
      >
        <span>View all news</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}