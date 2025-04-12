
export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  time: string | null;
  location: string | null;
  visibility: "public" | "friends" | "private";
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  time?: string;
  location?: string;
  visibility: "public" | "friends" | "private";
}
