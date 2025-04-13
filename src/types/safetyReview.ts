
export type Reviewer = {
  name: string;
  avatar: string;
  initials: string;
};

export type Review = {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  reviewer: Reviewer;
};
