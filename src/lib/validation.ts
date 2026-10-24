export function isValidHttpUrl(urlStr?: string | null): boolean {
  if (!urlStr || !urlStr.trim()) return true;
  try {
    const parsed = new URL(urlStr.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidAvatarUrl(urlStr?: string | null): boolean {
  if (!urlStr || !urlStr.trim()) return true;
  const trimmed = urlStr.trim();
  // Support Base64 data URLs for avatar images (e.g. data:image/png;base64,... or data:image/webp;base64,...)
  if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
    // Max 1MB Base64 payload
    return trimmed.length <= 1_000_000;
  }
  return isValidHttpUrl(trimmed);
}
