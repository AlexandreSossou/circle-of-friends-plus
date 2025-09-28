export interface Group {
  id: string;
  name: string;
  description: string | null;
  category: string;
  avatar_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  allowed_genders?: string[] | null;
  member_count?: number;
  user_role?: string | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface GroupFormData {
  name: string;
  description: string;
  category: string;
  is_public: boolean;
  allowed_genders?: string[] | null;
}