
export interface ProfileData {
  id: string;
  full_name: string;
  username?: string;
  private_username?: string; // New field for private profile username
  avatar_url: string;
  private_avatar_url?: string; // New field for private profile avatar
  cover_photo_url?: string; // New field for cover photo
  bio?: string;
  private_bio?: string; // New field for private profile bio
  location?: string;
  gender?: string;
  sexual_orientation?: string;
  expression?: string;
  libido?: string;
  age?: number;
  marital_status?: string;
  partner_id?: string;
  partners?: string[];
  private_marital_status?: string; // New field for private profile relationship status
  private_partner_id?: string; // New field for private profile single partner
  private_partners?: string[]; // New field for private profile multiple partners
  looking_for?: string[]; // New field for what user is looking for
  partner?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  public_profile_enabled?: boolean;
  private_profile_enabled?: boolean;
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
  isPhotoSafe?: boolean;
  visibleOnPublicProfile?: boolean;
  visibleOnPrivateProfile?: boolean;
}

export interface RelationshipPreference {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export type ProfileType = 'public' | 'private';
