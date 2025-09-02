
export type Reviewer = {
  name: string;
  avatar: string;
  initials: string;
};

export type Vouch = {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  reviewer: Reviewer;
};
