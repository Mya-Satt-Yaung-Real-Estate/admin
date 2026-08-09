/**
 * Admin display labels for Partnership Posts (share_profit_listings module).
 * API/DB values stay snake_case; only UI strings live here.
 */

export const PARTNERSHIP_POST = {
  module: 'Partnership Posts',
  singular: 'Partnership Post',
  management: 'Partnership Post Management',
  description: 'Manage property partnership posts',
  addButton: 'Add Partnership Post',
  createTitle: 'Create New Partnership Post',
  createBreadcrumb: 'Dashboard / Partnership Post Management / Create Partnership Post',
  backToList: 'Back to Partnership Posts',
  updateButton: 'Update Partnership Post',
  createButton: 'Create Partnership Post',
  detailsTitle: 'Partnership Post Details',
  detailsBreadcrumb: 'Dashboard / Partnership Post Management / Partnership Post Details',
  listBreadcrumb: 'Dashboard / Partnership Post Management',
  activeTab: 'Active Partnership Posts',
  deletedTab: 'Deleted Partnership Posts',
  totalStat: 'Total Partnership Posts',
  notFound: 'No Partnership Posts Found',
  errorLoading: 'Error Loading Partnership Posts',
  loadingDetails: 'Loading Partnership Post Details',
  refreshingDetails: 'Refreshing Partnership Post Details',
  notFoundTitle: 'Partnership Post Not Found',
  notFoundBody: "The partnership post you're looking for doesn't exist or has been removed.",
  approveTitle: 'Approve Partnership Post',
  rejectTitle: 'Reject Partnership Post',
  renewTitle: 'Renew Partnership Post',
  itemType: 'partnership post',
} as const;

/** Display order: Buyer, Seller, For Rent, Renter */
export const PARTNERSHIP_WANTED_TYPE_OPTIONS = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'for_rent', label: 'For Rent' },
  { value: 'renter', label: 'Renter' },
] as const;

export type PartnershipWantedType = (typeof PARTNERSHIP_WANTED_TYPE_OPTIONS)[number]['value'];

export const PARTNERSHIP_WANTED_TYPE_LABELS: Record<PartnershipWantedType, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  for_rent: 'For Rent',
  renter: 'Renter',
};

export const PARTNERSHIP_WANTED_TYPE_VALUES: PartnershipWantedType[] = [
  'buyer',
  'seller',
  'for_rent',
  'renter',
];
