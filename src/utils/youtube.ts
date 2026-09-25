/**
 * YouTube utility helpers for parsing links, extracting video IDs,
 * generating high-res thumbnails, and formatting watch URLs.
 */

export const extractYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Direct 11-character video ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL regex matching standard, short, embed, shorts, live, and thumbnail URLs (img.youtube.com, i.ytimg.com)
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/)|(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
};

export const getYouTubeThumbnail = (urlOrId?: string): string | null => {
  const id = extractYouTubeId(urlOrId);
  if (!id) return null;
  // hqdefault (480x360) is reliably available for all YouTube videos
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};

export const getYouTubeWatchUrl = (urlOrId?: string): string | null => {
  const id = extractYouTubeId(urlOrId);
  if (id) {
    return `https://www.youtube.com/watch?v=${id}`;
  }
  if (urlOrId && (urlOrId.startsWith('http://') || urlOrId.startsWith('https://'))) {
    return urlOrId.trim();
  }
  return null;
};

export const isValidYouTubeUrl = (url?: string): boolean => {
  return Boolean(extractYouTubeId(url));
};
