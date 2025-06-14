
export type Friend = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  mutualFriends: number;
  relationshipType?: 'friend' | 'acquaintance';
  temporaryUpgradeUntil?: Date | null;
  location?: string;
};
