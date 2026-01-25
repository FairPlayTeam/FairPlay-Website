export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fairplay.video";
export const SITE_NAME = "FairPlay";
export const DEFAULT_DESCRIPTION =
  "Your passions deserve more than an algorithm";
export const DEFAULT_OG_IMAGE = "/images/hero-video-thumbnail.png";
export const TWITTER_HANDLE = "@StreamNew90503";

export const METADATA_BASE = new URL(SITE_URL);

export const DEFAULT_OPEN_GRAPH_IMAGE = {
  url: DEFAULT_OG_IMAGE,
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export function getAbsoluteUrl(url: string | null, base: URL = METADATA_BASE) {
  if (!url) return undefined;
  try {
    return new URL(url, base).toString();
  } catch {
    return undefined;
  }
}
