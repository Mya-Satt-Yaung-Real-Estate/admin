import React from 'react';
import { Chip, ChipProps } from '@mui/material';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string | boolean;
  statusType?: 'status' | 'verification_status' | 'member_level';
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  statusType = 'status',
  size = 'small',
  ...chipProps 
}) => {
  // Convert boolean to string status
  const statusString = typeof status === 'boolean' 
    ? (status ? 'active' : 'inactive')
    : status;

  // Get status label based on status type
  const getStatusLabel = (status: string, type: 'status' | 'verification_status' | 'member_level'): string => {
    if (type === 'verification_status') {
      const verificationStatusMap: Record<string, string> = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
      };
      return verificationStatusMap[status] || status;
    } else if (type === 'member_level') {
      const memberLevelMap: Record<string, string> = {
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold',
        platinum: 'Platinum',
      };
      return memberLevelMap[status] || status;
    } else {
      const statusMap: Record<string, string> = {
        active: 'Active',
        inactive: 'Inactive',
        published: 'Published',
        draft: 'Draft',
        sold: 'Sold',
        rented: 'Rented',
        pending: 'Pending',
        rejected: 'Rejected',
        deleted: 'Deleted',
        approved: 'Approved',
        under_review: 'Under Review',
      };
      return statusMap[status] || status;
    }
  };

  // Get status colors based on status type
  const getStatusColors = (status: string, type: 'status' | 'verification_status' | 'member_level') => {
    if (type === 'verification_status') {
      const verificationColorMap: Record<string, { text: string; border: string; hoverBg: string; hoverBorder: string }> = {
        pending: {
          text: '#D97706', // Orange
          border: '#D97706',
          hoverBg: '#FFFBEB',
          hoverBorder: '#B45309',
        },
        approved: {
          text: '#059669', // Green
          border: '#059669',
          hoverBg: '#ECFDF5',
          hoverBorder: '#047857',
        },
        rejected: {
          text: '#DC2626', // Red
          border: '#DC2626',
          hoverBg: '#FEF2F2',
          hoverBorder: '#B91C1C',
        },
      };
      return verificationColorMap[status] || verificationColorMap.pending;
    } else if (type === 'member_level') {
      const memberLevelColorMap: Record<string, { text: string; border: string; hoverBg: string; hoverBorder: string }> = {
        bronze: {
          text: '#CD7F32', // Bronze color
          border: '#CD7F32',
          hoverBg: '#FDF8F3',
          hoverBorder: '#B8860B',
        },
        silver: {
          text: '#C0C0C0', // Silver color
          border: '#C0C0C0',
          hoverBg: '#F8F9FA',
          hoverBorder: '#A9A9A9',
        },
        gold: {
          text: '#FFD700', // Gold color
          border: '#FFD700',
          hoverBg: '#FFFBEB',
          hoverBorder: '#DAA520',
        },
        platinum: {
          text: '#E5E4E2', // Platinum color
          border: '#E5E4E2',
          hoverBg: '#F5F5F5',
          hoverBorder: '#B8B8B8',
        },
      };
      return memberLevelColorMap[status] || memberLevelColorMap.bronze;
    } else {
      const statusColorMap: Record<string, { text: string; border: string; hoverBg: string; hoverBorder: string }> = {
        active: {
          text: '#3B8880', // Teal-green
          border: '#3B8880',
          hoverBg: '#F0F9F8',
          hoverBorder: '#2F6B64',
        },
        inactive: {
          text: '#DC2626', // Red
          border: '#DC2626',
          hoverBg: '#FEF2F2',
          hoverBorder: '#B91C1C',
        },
        published: {
          text: '#059669', // Green
          border: '#059669',
          hoverBg: '#ECFDF5',
          hoverBorder: '#047857',
        },
        draft: {
          text: '#6B7280', // Gray
          border: '#6B7280',
          hoverBg: '#F9FAFB',
          hoverBorder: '#4B5563',
        },
        sold: {
          text: '#7C3AED', // Purple
          border: '#7C3AED',
          hoverBg: '#F5F3FF',
          hoverBorder: '#5B21B6',
        },
        rented: {
          text: '#0891B2', // Cyan
          border: '#0891B2',
          hoverBg: '#ECFEFF',
          hoverBorder: '#0E7490',
        },
        pending: {
          text: '#D97706', // Orange
          border: '#D97706',
          hoverBg: '#FFFBEB',
          hoverBorder: '#B45309',
        },
        rejected: {
          text: '#DC2626', // Red
          border: '#DC2626',
          hoverBg: '#FEF2F2',
          hoverBorder: '#B91C1C',
        },
        deleted: {
          text: '#DC2626', // Red
          border: '#DC2626',
          hoverBg: '#FEF2F2',
          hoverBorder: '#B91C1C',
        },
      };
      return statusColorMap[status] || statusColorMap.inactive;
    }
  };

  const label = getStatusLabel(statusString, statusType);
  const colors = getStatusColors(statusString, statusType);

  return (
    <Chip
      label={label}
      size={size}
      variant="outlined"
      sx={{
        backgroundColor: '#ffffff',
        color: colors.text,
        borderColor: colors.border,
        borderWidth: '1px',
        borderRadius: 2,
        fontWeight: 500,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        height: size === 'small' ? 24 : 32,
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5,
        },
        '&:hover': {
          backgroundColor: colors.hoverBg,
          borderColor: colors.hoverBorder,
          color: colors.hoverBorder,
        },
        '&:focus': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${colors.text}20`,
        },
        ...chipProps.sx,
      }}
      {...chipProps}
    />
  );
};

export default StatusChip;
