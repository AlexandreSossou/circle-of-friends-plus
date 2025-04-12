
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";
import AlbumPrivacySettings from "./AlbumPrivacySettings";

type Photo = string;

type Album = {
  id: number;
  name: string;
  photos: Photo[];
  isPrivate: boolean;
  allowedUsers: string[];
};

type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
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

  const handlePrivacyChange = (albumId: number, isPrivate: boolean, allowedUsers: string[]) => {
    const updatedAlbums = albums.map(album => 
      album.id === albumId 
        ? { ...album, isPrivate, allowedUsers } 
        : album
    );
    
    setAlbums(updatedAlbums);
    
    if (onAlbumChange) {
      onAlbumChange(updatedAlbums);
    }
  };

  const canViewAlbum = (album: Album) => {
    if (isOwnProfile) return true;
    if (!album.isPrivate) return true;
    if (currentUserId && album.allowedUsers.includes(currentUserId)) return true;
    return false;
  };

  return (
    <div className="space-y-8">
      {albums.map((album, albumIndex) => (
        <div key={album.id} className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">{album.name}</h3>
            {isOwnProfile && albumIndex > 0 && (
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
