export const MEMBER_LEVELS = {
  BASIC: 'basic',
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PREMIUM: 'premium',
} as const;

export type MemberLevel = (typeof MEMBER_LEVELS)[keyof typeof MEMBER_LEVELS];

export const MEMBER_LEVEL_VALUES: MemberLevel[] = [
  MEMBER_LEVELS.BASIC,
  MEMBER_LEVELS.BRONZE,
  MEMBER_LEVELS.SILVER,
  MEMBER_LEVELS.GOLD,
  MEMBER_LEVELS.PREMIUM,
];

export const MEMBER_LEVEL_OPTIONS = [
  { value: MEMBER_LEVELS.BASIC, label: 'Basic' },
  { value: MEMBER_LEVELS.BRONZE, label: 'Bronze' },
  { value: MEMBER_LEVELS.SILVER, label: 'Silver' },
  { value: MEMBER_LEVELS.GOLD, label: 'Gold' },
  { value: MEMBER_LEVELS.PREMIUM, label: 'Premium' },
] as const;

/** Map legacy stored values for display (e.g. platinum → premium). */
export function normalizeMemberLevel(level?: string | null): MemberLevel | string | null {
  if (!level) return null;
  const normalized = level.toLowerCase();
  if (normalized === 'platinum') return MEMBER_LEVELS.PREMIUM;
  return normalized;
}

export const MEMBER_LEVEL_COLORS: Record<MemberLevel, string> = {
  [MEMBER_LEVELS.BASIC]: '#94a3b8',
  [MEMBER_LEVELS.BRONZE]: '#cd7f32',
  [MEMBER_LEVELS.SILVER]: '#c0c0c0',
  [MEMBER_LEVELS.GOLD]: '#ffd700',
  [MEMBER_LEVELS.PREMIUM]: '#a855f7',
};
