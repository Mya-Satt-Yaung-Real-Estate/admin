import React from 'react';
import { Chip, ChipProps } from '@mui/material';

export const PREMIUM_FEATURE_BADGE_SX = {
  backgroundColor: '#ffffff',
  color: '#9333EA',
  borderColor: '#A855F7',
  borderWidth: '1px',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#FAF5FF',
    borderColor: '#7E22CE',
    color: '#7E22CE',
  },
} as const;

export interface FeatureBadgeChipProps extends Omit<ChipProps, 'label' | 'variant'> {
  label: string;
}

const FeatureBadgeChip: React.FC<FeatureBadgeChipProps> = ({
  label,
  size = 'small',
  sx,
  ...chipProps
}) => (
  <Chip
    label={label}
    variant="outlined"
    size={size}
    sx={{ ...PREMIUM_FEATURE_BADGE_SX, ...sx }}
    {...chipProps}
  />
);

export default FeatureBadgeChip;
