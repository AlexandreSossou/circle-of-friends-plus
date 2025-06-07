
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon, ShieldIcon } from "lucide-react";
import AlbumPrivacySettings from "./AlbumPrivacySettings";

type Photo = string;

type Album = {
  id: number;
  name: string;
  photos: Photo[];
  isPrivate: boolean;
  allowedUsers: string[];
  isPhotoSafe?: boolean;
};

type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
  relationshipType?: 'friend' | 'acquaintance';
};

type PhotoAlbumProps = {
  albums: Album[];
  friends: Friend[];
  isOwnProfile: boolean;
  currentUserId?: string;
  onAlbumChange?: (albums: Album[]) => void;
};

const PhotoAlbum = ({ albums: initialAlbums, friends, isOwnProfile, currentUserId, onAlbumChange }: PhotoAlbumProps) => {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);

  // Effect to automatically update album permissions when friends change their relationship type
  useEffect(() => {
    if (!isOwnProfile) return;

    const closeFriendIds = friends
      .filter(friend => friend.relationshipType === 'friend')
      .map(friend => friend.id);

    const updatedAlbums = albums.map(album => {
      // Photo Safe album should never be accessible to anyone else
      if (album.isPhotoSafe) {
        return album;
      }
      
      if (album.isPrivate) {
        // For each private album, make sure all close friends have access
        const newAllowedUsers = [...album.allowedUsers];
        
        for (const friendId of closeFriendIds) {
          if (!newAllowedUsers.includes(friendId)) {
            newAllowedUsers.push(friendId);
          }
        }
        
        return { ...album, allowedUsers: newAllowedUsers };
      }
      return album;
    });
    
    setAlbums(updatedAlbums);
    
    if (onAlbumChange) {
      onAlbumChange(updatedAlbums);
    }
  }, [friends, isOwnProfile]);

  const handlePrivacyChange = (albumId: number, isPrivate: boolean, allowedUsers: string[]) => {
    // When updating privacy settings, ensure all close friends are included
    let updatedAllowedUsers = [...allowedUsers];
    
    if (isPrivate) {
      const closeFriendIds = friends
        .filter(friend => friend.relationshipType === 'friend')
        .map(friend => friend.id);
      
      for (const friendId of closeFriendIds) {
        if (!updatedAllowedUsers.includes(friendId)) {
          updatedAllowedUsers.push(friendId);
        }
      }
    }
    
    const updatedAlbums = albums.map(album => 
      album.id === albumId 
        ? { ...album, isPrivate, allowedUsers: updatedAllowedUsers } 
        : album
    );
    
    setAlbums(updatedAlbums);
    
    if (onAlbumChange) {
      onAlbumChange(updatedAlbums);
    }
  };

  const canViewAlbum = (album: Album) => {
    // Photo Safe album is only visible to the profile owner
    if (album.isPhotoSafe) {
      return isOwnProfile;
    }
    
    if (isOwnProfile) return true;
    if (!album.isPrivate) return true;
    if (currentUserId && album.allowedUsers.includes(currentUserId)) return true;
    return false;
  };

  // Filter albums to show - Photo Safe is only shown to the profile owner
  const visibleAlbums = albums.filter(album => {
    if (album.isPhotoSafe) {
      return isOwnProfile;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {visibleAlbums.map((album, albumIndex) => (
        <div key={album.id} className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{album.name}</h3>
              {album.isPhotoSafe && (
                <ShieldIcon className="w-5 h-5 text-orange-500" title="Photo Safe - Only you can see these photos" />
              )}
            </div>
            {isOwnProfile && albumIndex > 0 && !album.isPhotoSafe && (
              <AlbumPrivacySettings 
                albumId={album.id}
                albumName={album.name}
                isPrivate={album.isPrivate}
                allowedUsers={album.allowedUsers}
                friends={friends}
                onSave={handlePrivacyChange}
              />
            )}
          </div>
          
          {album.isPhotoSafe && isOwnProfile && (
            <p className="text-sm text-social-textSecondary mb-4">
              Photos in this album are completely private and will never be displayed anywhere on the website.
            </p>
          )}
          
          {canViewAlbum(album) ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {album.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Photo ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-social-textSecondary mb-4">This album is private</p>
              <Button variant="outline">Request Access</Button>
            </div>
          )}
        </div>
      ))}
      
      {isOwnProfile && (
        <Button className="mt-4">
          <CameraIcon className="w-4 h-4 mr-2" />
          Create New Album
        </Button>
      )}
    </div>
  );
};

export default PhotoAlbum;
