
export interface Travel {
  id: string;
  user_id: string;
  city: string;
  country: string;
  arrival_date: string;
  departure_date: string;
  looking_for: "locals" | "tourists" | "both";
  description: string | null;
  traveling_with_partner: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
