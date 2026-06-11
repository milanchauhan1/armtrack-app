import type { MetadataRoute } from "next";

const SITE_URL = "https://armtrack.app";

// Static export (output: 'export') generates /robots.txt at build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth-gated / app-only routes have no SEO value and shouldn't be crawled.
        disallow: [
          "/dashboard/",
          "/log/",
          "/history/",
          "/onboarding/",
          "/reset-password/",
          "/update-password/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
