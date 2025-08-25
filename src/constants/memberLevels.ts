export const MEMBER_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

export type MemberLevel = typeof MEMBER_LEVELS[keyof typeof MEMBER_LEVELS];

export const MEMBER_LEVEL_OPTIONS = [
  { value: MEMBER_LEVELS.BRONZE, label: 'Bronze' },
  { value: MEMBER_LEVELS.SILVER, label: 'Silver' },
  { value: MEMBER_LEVELS.GOLD, label: 'Gold' },
  { value: MEMBER_LEVELS.PLATINUM, label: 'Platinum' },
] as const;

export const MEMBER_LEVEL_COLORS = {
  [MEMBER_LEVELS.BRONZE]: '#cd7f32', // Bronze color
  [MEMBER_LEVELS.SILVER]: '#c0c0c0', // Silver color
  [MEMBER_LEVELS.GOLD]: '#ffd700',   // Gold color
  [MEMBER_LEVELS.PLATINUM]: '#e5e4e2', // Platinum color
} as const;
