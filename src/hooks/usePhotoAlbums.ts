import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Photo {
  id: string;
  file_url: string;
  caption?: string;
  created_at: string;
}

export interface PhotoAlbum {
  id: string;
  name: string;
  is_private: boolean;
  allowed_users: string[];
  is_photo_safe: boolean;
  visible_on_public_profile: boolean;
  visible_on_private_profile: boolean;
  photos: Photo[];
}

export const usePhotoAlbums = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch albums with photos
  const { data: albums = [], isLoading } = useQuery({
    queryKey: ["photo-albums", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: albumsData, error: albumsError } = await supabase
        .from("photo_albums")
        .select("*")
        .eq("user_id", userId)
        .order("is_photo_safe", { ascending: false }) // Photo Safe first
        .order("created_at", { ascending: true });

      if (albumsError) throw albumsError;

      // Fetch photos for each album
      const albumsWithPhotos = await Promise.all(
        (albumsData || []).map(async (album) => {
          const { data: photos, error: photosError } = await supabase
            .from("photos")
            .select("*")
            .eq("album_id", album.id)
            .order("created_at", { ascending: false });

          if (photosError) console.error("Error fetching photos:", photosError);

          return {
            ...album,
            photos: photos || [],
          };
        })
      );

      return albumsWithPhotos as PhotoAlbum[];
    },
    enabled: !!userId,
  });

  // Create album mutation
  const createAlbumMutation = useMutation({
    mutationFn: async ({
      name,
      isPrivate = false,
      allowedUsers = [],
    }: {
      name: string;
      isPrivate?: boolean;
      allowedUsers?: string[];
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("photo_albums")
        .insert({
          user_id: userId,
          name,
          is_private: isPrivate,
          allowed_users: allowedUsers,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums", userId] });
      toast({
        title: "Album created",
        description: "Your new album has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating album:", error);
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update album mutation
  const updateAlbumMutation = useMutation({
    mutationFn: async ({
      albumId,
      updates,
    }: {
      albumId: string;
      updates: Partial<PhotoAlbum>;
    }) => {
      const { data, error } = await supabase
        .from("photo_albums")
        .update(updates)
        .eq("id", albumId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums", userId] });
    },
    onError: (error) => {
      console.error("Error updating album:", error);
      toast({
        title: "Error",
        description: "Failed to update album. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete album mutation
  const deleteAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => {
      const { error } = await supabase
        .from("photo_albums")
        .delete()
        .eq("id", albumId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums", userId] });
      toast({
        title: "Album deleted",
        description: "The album has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting album:", error);
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({
      albumId,
      file,
      caption,
    }: {
      albumId: string;
      file: File;
      caption?: string;
    }) => {
      if (!userId) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${albumId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(fileName);

      // Save photo record to database
      const { data, error } = await supabase
        .from("photos")
        .insert({
          album_id: albumId,
          user_id: userId,
          file_url: publicUrl,
          caption,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums", userId] });
      toast({
        title: "Photo uploaded",
        description: "Your photo has been uploaded successfully.",
      });
    },
    onError: (error) => {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase.from("photos").delete().eq("id", photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo-albums", userId] });
      toast({
        title: "Photo deleted",
        description: "The photo has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    albums,
    isLoading,
    createAlbum: createAlbumMutation.mutate,
    updateAlbum: updateAlbumMutation.mutate,
    deleteAlbum: deleteAlbumMutation.mutate,
    uploadPhoto: uploadPhotoMutation.mutate,
    deletePhoto: deletePhotoMutation.mutate,
    isCreatingAlbum: createAlbumMutation.isPending,
    isUploadingPhoto: uploadPhotoMutation.isPending,
  };
};
