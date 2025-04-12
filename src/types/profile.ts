
export type ProfileData = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  gender: string | null;
  age: number | null;
  marital_status: string | null;
  partner_id: string | null;
  partner?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
};

export type Photo = string;

export type Album = {
  id: number;
  name: string;
  photos: Photo[];
  isPrivate: boolean;
  allowedUsers: string[];
};

export type Post = {
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
  comments: any[];
  liked: boolean;
};
