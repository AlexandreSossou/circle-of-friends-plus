
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Share, ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/types/news";

interface NewsCardProps {
  article: Article;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-4">
          {article.imageUrl && (
            <div className="md:w-1/4 h-48 md:h-auto overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`flex-1 p-4 ${!article.imageUrl ? 'md:w-full' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg mb-1">{article.title}</h3>
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
