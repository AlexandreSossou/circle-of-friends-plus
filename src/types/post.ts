
export interface PostData {
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
  isGlobal?: boolean;
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    initials: string;
  };
  content: string;
  timestamp: string;
}
