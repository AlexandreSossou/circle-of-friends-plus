
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsCard from "@/components/news/NewsCard";
import { useNews } from "@/hooks/useNews";
import { Newspaper, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const News = () => {
  const { news, isLoading, categories, activeCategory, setActiveCategory } = useNews();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="social-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-social-blue" />
              <h1 className="text-2xl font-bold">News</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mb-4">
              <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="w-full justify-start overflow-x-auto flex-nowrap pb-1">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {news.length > 0 ? (
                news.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Newspaper className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">No news articles found</h3>
                  <p className="text-social-textSecondary">
                    Try selecting a different category or check back later
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default News;
