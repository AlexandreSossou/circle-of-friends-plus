import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NewsFormData {
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  category: string;
  sourceUrl: string;
}

const NewsManagement = () => {
  const { news, isLoading, refetch } = useNews();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    summary: "",
    imageUrl: "",
    category: "general",
    sourceUrl: ""
  });

  const categories = ["general", "technology", "sports", "entertainment", "health", "business", "politics"];

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      imageUrl: "",
      category: "general",
      sourceUrl: ""
    });
    setEditingArticle(null);
  };

  const handleOpenDialog = (article?: any) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || "",
        imageUrl: article.image_url || "",
        category: article.category || "general",
        sourceUrl: article.source_url || ""
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || null,
        image_url: formData.imageUrl || null,
        category: formData.category,
        source_url: formData.sourceUrl || null,
        author_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin'
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
        toast({ title: "News article updated successfully" });
      } else {
        const { error } = await supabase
          .from('news_articles')
          .insert([articleData]);

        if (error) throw error;
        toast({ title: "News article published successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error saving article",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;
      
      toast({ title: "Article deleted successfully" });
      refetch();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error deleting article",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">News Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Publish News
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit News Article" : "Publish News Article"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl">Source URL</Label>
                <Input
                  id="sourceUrl"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : editingArticle ? "Update" : "Publish"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div>Loading articles...</div>
        ) : (
          news.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {article.category} • {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {article.summary && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsManagement;