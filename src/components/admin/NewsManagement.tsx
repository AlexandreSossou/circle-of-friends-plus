import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Edit, Trash2, Upload, Video, FileText } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NewsFormData {
  title: string;
  content: string;
  summary: string;
  mediaUrl: string;
  category: string;
  sourceUrl: string;
  type: 'article' | 'video';
  duration?: number;
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
    mediaUrl: "",
    category: "general",
    sourceUrl: "",
    type: "article"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ["general", "technology", "sports", "entertainment", "health", "business", "politics"];

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      summary: "",
      mediaUrl: "",
      category: "general",
      sourceUrl: "",
      type: "article"
    });
    setEditingArticle(null);
    setSelectedFile(null);
  };

  const handleOpenDialog = (article?: any) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || "",
        mediaUrl: article.image_url || article.video_url || "",
        category: article.category || "general",
        sourceUrl: article.source_url || "",
        type: article.video_url ? "video" : "article",
        duration: article.duration
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please select a video or image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB for images, max 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    const fileTypeText = isVideo ? "video" : "image";
    const sizeText = isVideo ? "50MB" : "10MB";
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${fileTypeText} must be smaller than ${sizeText}`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setFormData(prev => ({ ...prev, type: isVideo ? "video" : "article" }));

    // For videos, get duration
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setFormData(prev => ({ ...prev, duration: Math.round(video.duration) }));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `news/${Date.now()}.${fileExt}`;
    const bucket = file.type.startsWith('video/') ? 'videos' : 'images';

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      let mediaUrl = formData.mediaUrl;

      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        mediaUrl = await uploadFile(selectedFile);
      }

      const articleData = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || null,
        category: formData.category,
        source_url: formData.sourceUrl || null,
        author_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
        content_type: formData.type,
        duration: formData.duration || null,
        ...(formData.type === 'video' 
          ? { video_url: mediaUrl, image_url: null }
          : { image_url: mediaUrl, video_url: null }
        )
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
        title: "Error saving content",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
        <h2 className="text-xl font-semibold">News & Video Shorts Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Content" : "Create New Content"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Type Selection */}
              <div className="space-y-3">
                <Label>Content Type *</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(value: 'article' | 'video') => setFormData({ ...formData, type: value })}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="article" id="article" />
                    <Label htmlFor="article" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Article
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                      <Video className="h-4 w-4" />
                      Video Short
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label>
                  {formData.type === 'video' ? 'Video Upload (Vertical Format Recommended)' : 'Image/Media Upload'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept={formData.type === 'video' ? 'video/*' : 'image/*,video/*'}
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    {formData.duration && ` • ${formData.duration}s`}
                  </p>
                )}
                {formData.type === 'video' && (
                  <p className="text-xs text-muted-foreground">
                    📱 For best results, upload vertical videos (9:16 aspect ratio) up to 50MB
                  </p>
                )}
              </div>

              {/* Alternative URL input */}
              <div className="space-y-2">
                <Label htmlFor="mediaUrl">Or {formData.type === 'video' ? 'Video' : 'Media'} URL</Label>
                <Input
                  id="mediaUrl"
                  type="url"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  placeholder={`Enter ${formData.type === 'video' ? 'video' : 'image'} URL`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={2}
                  placeholder={formData.type === 'video' ? 'Brief description for the video short' : 'Article summary'}
                />
              </div>

              {formData.type === 'article' && (
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
              )}

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
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isUploading ? "Uploading..." : isSubmitting ? "Publishing..." : editingArticle ? "Update" : "Publish"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div>Loading content...</div>
        ) : (
          news.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {(article as any).video_url ? (
                        <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        {(article as any).video_url && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            <Video className="h-3 w-3" />
                            Video Short
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {article.category} • {new Date(article.publishedAt).toLocaleDateString()}
                        {(article as any).duration && ` • ${(article as any).duration}s`}
                      </p>
                    </div>
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