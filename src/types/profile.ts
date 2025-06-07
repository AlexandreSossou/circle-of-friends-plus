
export interface ProfileData {
  id: string;
  full_name: string;
  username?: string;
  avatar_url: string;
  bio?: string;
  location?: string;
  gender?: string;
  age?: number;
  marital_status?: string;
  partner_id?: string;
  partners?: string[]; // Added this line to resolve the TypeScript error
  partner?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
  relationshipType?: 'friend' | 'acquaintance';
}

export interface Album {
  id: number;
  name: string;
  photos: string[];
  isPrivate: boolean;
  allowedUsers: string[];
  isPhotoSafe?: boolean; // Special flag for the Photo Safe album
}
