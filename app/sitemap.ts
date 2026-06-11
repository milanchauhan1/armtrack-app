import type { MetadataRoute } from "next";

const SITE_URL = "https://armtrack.app";

// Static export (output: 'export') generates /sitemap.xml at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Only public, indexable marketing/entry pages — not auth-gated app routes.
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/signup/`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/join/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
