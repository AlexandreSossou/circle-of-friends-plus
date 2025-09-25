
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Share, ThumbsUp, MessageSquare, Video, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/hooks/useNews";

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4">
          {/* Video Content */}
          {article.contentType === 'video' && article.videoUrl && (
            <div className="relative">
              <video 
                controls
                className="w-full max-h-96 object-contain bg-black"
                poster={article.imageUrl}
              >
                <source src={article.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {article.duration && (
                <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  {Math.floor(article.duration / 60)}:{(article.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          )}
          
          {/* Image Content for Articles */}
          {article.contentType === 'article' && article.imageUrl && (
            <div className="h-48 overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{article.title}</h3>
                  {article.contentType === 'video' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <Play className="h-3 w-3" />
                      Video Short
                    </div>
                  )}
                </div>
                <p className="text-sm text-social-textSecondary mb-2">
                  {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })} • 
                  {article.source}
                </p>
              </div>
              {article.category && (
                <Badge variant="outline" className="ml-2">
                  {article.category}
                </Badge>
              )}
            </div>
            
            {/* Show summary for videos, full content for articles */}
            {article.contentType === 'video' ? (
              article.summary && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                </div>
              )
            ) : (
              <>
                <div className={`mt-2 ${isExpanded ? '' : 'line-clamp-3'}`}>
                  <p>{article.content}</p>
                </div>
                
                {article.content.length > 150 && (
                  <Button 
                    variant="link" 
                    className="mt-1 p-0 h-auto text-social-blue"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Read less' : 'Read more'}
                  </Button>
                )}
              </>
            )}
            
            <div className="flex mt-4 pt-3 border-t border-gray-100 justify-between">
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{article.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{article.comments}</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
