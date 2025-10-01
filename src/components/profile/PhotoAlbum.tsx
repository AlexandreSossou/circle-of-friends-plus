import { useState, useEffect } from "react";
import { ShieldIcon, Trash2 } from "lucide-react";
import AlbumPrivacySettings from "./AlbumPrivacySettings";
import AlbumVisibilitySettings from "./AlbumVisibilitySettings";
import CreateAlbumDialog from "./CreateAlbumDialog";
import UploadPhotoDialog from "./UploadPhotoDialog";
import { ProfileType } from "@/types/profile";
import { usePhotoAlbums, PhotoAlbum as DBPhotoAlbum, Photo } from "@/hooks/usePhotoAlbums";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
  relationshipType?: 'friend' | 'acquaintance';
};

type PhotoAlbumProps = {
  userId: string;
  friends: Friend[];
  isOwnProfile: boolean;
  currentUserId?: string;
  profileType: ProfileType;
};

const PhotoAlbum = ({ 
  userId,
  friends, 
  isOwnProfile, 
  currentUserId, 
  profileType 
}: PhotoAlbumProps) => {
  const {
    albums,
    isLoading,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    uploadPhoto,
    deletePhoto,
    isCreatingAlbum,
    isUploadingPhoto,
  } = usePhotoAlbums(userId);

  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [deleteAlbumId, setDeleteAlbumId] = useState<string | null>(null);

  const handlePrivacyChange = (albumId: string, isPrivate: boolean, allowedUsers: string[]) => {
    updateAlbum({
      albumId,
      updates: {
        is_private: isPrivate,
        allowed_users: allowedUsers,
      },
    });
  };

  const handleVisibilityChange = (albumId: string, visibleOnPublic: boolean, visibleOnPrivate: boolean) => {
    updateAlbum({
      albumId,
      updates: {
        visible_on_public_profile: visibleOnPublic,
        visible_on_private_profile: visibleOnPrivate,
      },
    });
  };

  const canViewAlbum = (album: DBPhotoAlbum) => {
    if (album.is_photo_safe) {
      return isOwnProfile;
    }
    
    if (isOwnProfile) return true;
    if (!album.is_private) return true;
    if (currentUserId && album.allowed_users.includes(currentUserId)) return true;
    return false;
  };

  const isAlbumVisibleOnProfileType = (album: DBPhotoAlbum) => {
    if (album.is_photo_safe) {
      return isOwnProfile;
    }
    
    if (profileType === 'public') {
      return album.visible_on_public_profile ?? true;
    } else {
      return album.visible_on_private_profile ?? true;
    }
  };

  const visibleAlbums = albums.filter(album => {
    return isAlbumVisibleOnProfileType(album) && canViewAlbum(album);
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading albums...</div>;
  }

  return (
    <div className="space-y-8">
      {visibleAlbums.map((album, albumIndex) => (
        <div key={album.id} className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{album.name}</h3>
              {album.is_photo_safe && (
                <ShieldIcon className="w-5 h-5 text-orange-500" />
              )}
            </div>
            {isOwnProfile && (
              <div className="flex gap-2">
                {!album.is_photo_safe && (
                  <>
                    <UploadPhotoDialog
                      albumId={album.id}
                      albumName={album.name}
                      onUploadPhoto={(albumId, file, caption) => uploadPhoto({ albumId, file, caption })}
                      isUploading={isUploadingPhoto}
                    />
                    <AlbumPrivacySettings 
                      albumId={album.id}
                      albumName={album.name}
                      isPrivate={album.is_private}
                      allowedUsers={album.allowed_users}
                      friends={friends}
                      onSave={handlePrivacyChange}
                    />
                    <AlbumVisibilitySettings
                      album={{
                        id: album.id,
                        name: album.name,
                        visibleOnPublicProfile: album.visible_on_public_profile,
                        visibleOnPrivateProfile: album.visible_on_private_profile,
                      }}
                      onSave={handleVisibilityChange}
                    />
                    {albumIndex > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteAlbumId(album.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
                {album.is_photo_safe && (
                  <UploadPhotoDialog
                    albumId={album.id}
                    albumName={album.name}
                    onUploadPhoto={(albumId, file, caption) => uploadPhoto({ albumId, file, caption })}
                    isUploading={isUploadingPhoto}
                  />
                )}
              </div>
            )}
          </div>
          
          {album.is_photo_safe && isOwnProfile && (
            <p className="text-sm text-social-textSecondary mb-4">
              Photos in this album are completely private and will never be displayed anywhere on the website.
            </p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {album.photos.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-lg overflow-hidden relative group">
                <img 
                  src={photo.file_url} 
                  alt={photo.caption || `Photo in ${album.name}`} 
                  className="w-full h-full object-cover"
                />
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletePhotoId(photo.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {isOwnProfile && (
        <CreateAlbumDialog
          onCreateAlbum={(name, isPrivate) => createAlbum({ name, isPrivate })}
          isCreating={isCreatingAlbum}
        />
      )}

      {/* Delete Photo Confirmation Dialog */}
      <AlertDialog open={!!deletePhotoId} onOpenChange={() => setDeletePhotoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletePhotoId) {
                  deletePhoto(deletePhotoId);
                  setDeletePhotoId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Album Confirmation Dialog */}
      <AlertDialog open={!!deleteAlbumId} onOpenChange={() => setDeleteAlbumId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this album? All photos in this album will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteAlbumId) {
                  deleteAlbum(deleteAlbumId);
                  setDeleteAlbumId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhotoAlbum;
