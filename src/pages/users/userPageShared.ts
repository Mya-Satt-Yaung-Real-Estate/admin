export const DEFAULT_COVER_IMAGE = 'https://msy-demo.s3.ap-southeast-1.amazonaws.com/default/default-cover.jpeg';

/** Shared profile/cover image area height on user edit & detail pages (tier 6). */
export const USER_EDIT_IMAGE_MIN_HEIGHT = { xs: 230, sm: 250 } as const;

export const DETAIL_ICON_SX = {
  person: { color: 'primary.main' },
  phone: { color: 'success.main' },
  business: { color: 'primary.main' },
  star: { color: 'warning.main' },
  calendar: { color: 'info.main' },
  location: { color: 'error.main' },
  description: { color: 'secondary.main' },
  home: { color: 'primary.main' },
} as const;

export const detailListSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
  columnGap: 3,
  rowGap: 0.5,
  '& .MuiListItem-root': {
    px: 0,
    alignItems: 'flex-start',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    mt: 0.5,
  },
} as const;
