import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import type { VideosResponse } from "@/lib/video";

const VIDEO_PAGE_SIZE = 50;
const MAX_VIDEO_PAGES = 50;
const SITEMAP_REVALIDATE_SECONDS = 60;

function normalizeApiBase(apiBase: string) {
  return apiBase.replace(/\/$/, "");
}

function parseLastModified(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

async function fetchVideosPage(
  apiBase: string,
  page: number
): Promise<VideosResponse | null> {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(VIDEO_PAGE_SIZE),
  }).toString();
  const res = await fetch(`${apiBase}/videos?${qs}`,
    {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    }
  );

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as VideosResponse;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/docs/contribution-guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/roadmap`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    return staticEntries;
  }

  const normalizedApiBase = normalizeApiBase(apiBase);
  const firstPage = await fetchVideosPage(normalizedApiBase, 1);
  if (!firstPage?.videos?.length) {
    return staticEntries;
  }

  const totalPages = firstPage.pagination?.totalPages ?? 1;
  const pagesToFetch = Math.min(totalPages, MAX_VIDEO_PAGES);
  const videos = [...firstPage.videos];

  for (let page = 2; page <= pagesToFetch; page += 1) {
    const pageData = await fetchVideosPage(normalizedApiBase, page);
    if (!pageData?.videos?.length) {
      break;
    }
    videos.push(...pageData.videos);
  }

  const videoEntries: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${SITE_URL}/video/${encodeURIComponent(video.id)}`,
    lastModified: parseLastModified(video.createdAt, now),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...videoEntries];
}
