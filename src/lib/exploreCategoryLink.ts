export function isValidExploreCategoryLink(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  return trimmed.startsWith('/');
}
