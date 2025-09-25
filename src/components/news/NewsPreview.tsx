import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNews } from "@/hooks/useNews";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Video } from "lucide-react";

export default function NewsPreview() {
  const { news, isLoading } = useNews();
  
  // Get the most recent content
  const recentNews = news.slice(0, 4);
  
  // Separate videos and articles
  const videos = recentNews.filter(item => item.contentType === 'video').slice(0, 2);
  const articles = recentNews.filter(item => item.contentType !== 'video').slice(0, 3);

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
      
      {/* Video Shorts Section */}
      {videos.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <Video className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Video Shorts</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {videos.map((video) => (
              <Link key={video.id} to="/news" className="group">
                <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  {video.videoUrl ? (
                    <video 
                      className="w-full h-full object-cover"
                      poster={video.imageUrl}
                      muted
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                    </video>
                  ) : video.imageUrl ? (
                    <img 
                      src={video.imageUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                      <Video className="w-8 h-8 text-white/80" />
                    </div>
                  )}
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-2">
                      <Play className="w-4 h-4 text-black fill-current" />
                    </div>
                  </div>
                  
                  {/* Duration indicator */}
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <h4 className="text-white text-xs font-medium line-clamp-2 leading-tight">
                      {video.title}
                    </h4>
                    {video.category && (
                      <Badge variant="outline" className="text-xs px-1 py-0 mt-1 border-white/50 text-white">
                        {video.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Articles Section */}
      <div className="space-y-3">
        {articles.length > 0 ? (
          articles.map((article) => (
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
        ) : videos.length === 0 ? (
          <p className="text-sm text-social-textSecondary">No news available</p>
        ) : null}
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