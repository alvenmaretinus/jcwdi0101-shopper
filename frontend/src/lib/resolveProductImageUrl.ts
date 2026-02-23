const DEFAULT_FALLBACK_IMAGE = "https://placehold.co/400x400?text=No+Image";

export function resolveProductImageUrl(
  rawUrl?: string | null,
  fallbackImage: string = DEFAULT_FALLBACK_IMAGE
): string {
  if (!rawUrl || typeof rawUrl !== "string") return fallbackImage;

  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl) return fallbackImage;

  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (trimmedUrl.startsWith("/")) {
    return apiBaseUrl ? `${apiBaseUrl}${trimmedUrl}` : trimmedUrl;
  }

  return trimmedUrl;
}
