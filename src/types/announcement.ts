export interface Announcement {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string;
  category: string;
  visibility: "public" | "friends" | "private";
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface AnnouncementFormData {
  title: string;
  description: string;
  location: string;
  category: string;
  visibility: "public" | "friends" | "private";
}