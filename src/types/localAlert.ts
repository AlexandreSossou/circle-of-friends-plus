export interface LocalAlert {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string;
  category: string;
  visibility: "public" | "friends" | "private";
  expires_at: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface LocalAlertFormData {
  title: string;
  description: string;
  location: string;
  category: string;
  visibility: "public" | "friends";
  duration: string; // in minutes: "30", "60", "120", "240", "480", "720"
}