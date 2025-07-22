// Standard status values used throughout the application
export const STATUS_VALUES = {
  active: 'active',
  inactive: 'inactive',
  pending: 'pending',
  draft: 'draft',
  published: 'published',
  archived: 'archived',
} as const;

export type StatusValue = typeof STATUS_VALUES[keyof typeof STATUS_VALUES];

// Status configuration with colors and labels
export const STATUS_CONFIG = {
  [STATUS_VALUES.active]: {
    label: 'Active',
    color: 'success' as const,
    icon: 'check_circle',
  },
  [STATUS_VALUES.inactive]: {
    label: 'Inactive',
    color: 'error' as const,
    icon: 'cancel',
  },
  [STATUS_VALUES.pending]: {
    label: 'Pending',
    color: 'warning' as const,
    icon: 'schedule',
  },
  [STATUS_VALUES.draft]: {
    label: 'Draft',
    color: 'default' as const,
    icon: 'edit',
  },
  [STATUS_VALUES.published]: {
    label: 'Published',
    color: 'success' as const,
    icon: 'publish',
  },
  [STATUS_VALUES.archived]: {
    label: 'Archived',
    color: 'default' as const,
    icon: 'archive',
  },
} as const;

// Status utility functions
export const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' | 'primary' | 'secondary' | 'info' => {
  return STATUS_CONFIG[status as StatusValue]?.color || 'default';
};

export const getStatusLabel = (status: string): string => {
  return STATUS_CONFIG[status as StatusValue]?.label || status;
};

export const getStatusIcon = (status: string): string => {
  return STATUS_CONFIG[status as StatusValue]?.icon || 'help';
};

export const getStatusCount = <T extends { status: string }>(items: T[], status: string): number => {
  return items.filter(item => item.status === status).length;
};

export const getStatusStats = <T extends { status: string }>(items: T[]) => {
  const stats: Record<string, number> = {};
  
  Object.values(STATUS_VALUES).forEach(status => {
    stats[status] = getStatusCount(items, status);
  });
  
  return stats;
}; 