export const DEVELOPER_EMAILS = [
  'admin@jadeproperty.site',
  'admin@myasattyaung.com',
  'myasattyaung.dev@gmail.com',
];

export const MARKETER_EMAILS = [
  'market@jadeproperty.com.mm',
];

export const MARKETER_ALLOWED_MENU_ITEMS = [
  'Properties',
];

export const MARKETER_ALLOWED_PATH_PREFIXES = [
  '/properties',
];

export function hasDeveloperAccess(email?: string | null): boolean {
  return Boolean(email && DEVELOPER_EMAILS.includes(email));
}

export function hasMarketerAccess(email?: string | null): boolean {
  return Boolean(email && MARKETER_EMAILS.includes(email));
}

export function isMarketerOnlyAccess(email?: string | null): boolean {
  return hasMarketerAccess(email) && !hasDeveloperAccess(email);
}

export function isMarketerAllowedPath(pathname: string): boolean {
  return MARKETER_ALLOWED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
