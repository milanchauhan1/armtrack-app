import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, postUrl, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Arm Health Guides for Baseball Players & Coaches",
  description:
    "Practical guides on pitch counts, arm soreness, recovery, and throwing workload for baseball and softball players, coaches, and parents.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    type: "website",
    url: "https://armtrack.app/blog/",
    title: "Arm Health Guides — ArmTrack",
    description:
      "Practical guides on pitch counts, arm soreness, recovery, and throwing workload for baseball and softball.",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://armtrack.app/blog/#blog",
    name: "ArmTrack Arm Health Guides",
    url: "https://armtrack.app/blog/",
    publisher: { "@id": "https://armtrack.app/#organization" },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: postUrl(p.slug),
      datePublished: p.datePublished,
      dateModified: p.dateModified,
      author: { "@type": "Person", name: p.author },
    })),
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #141414",
          position: "sticky",
          top: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>
          <span style={{ color: "#f5f5f5" }}>Arm</span>
          <span style={{ color: "#3B82F6" }}>Track</span>
        </Link>
        <Link
          href="/signup"
          style={{
            background: "#3B82F6",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 999,
            boxShadow: "0 0 16px rgba(59,130,246,0.4)",
          }}
        >
          Get Started Free
        </Link>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 100px" }}>
        <p style={{ color: "#3B82F6", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>
          Arm Health Guides
        </p>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>
          Smarter throwing decisions start with better information.
        </h1>
        <p style={{ color: "#a1a1aa", fontSize: 17, lineHeight: 1.6, margin: "0 0 56px", maxWidth: 580 }}>
          Practical, no-hype guides on pitch counts, soreness, recovery, and workload — for players,
          coaches, and parents.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}/`}
              style={{
                display: "block",
                textDecoration: "none",
                background: "#0d0d0d",
                border: "1px solid #1c1c1c",
                borderRadius: 18,
                padding: "26px 28px",
                transition: "border-color 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ color: "#3B82F6", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {p.category}
                </span>
                <span style={{ color: "#3f3f46" }}>•</span>
                <span style={{ color: "#71717a", fontSize: 12.5 }}>{p.readingMinutes} min read</span>
              </div>
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25, margin: "0 0 8px" }}>
                {p.title}
              </h2>
              <p style={{ color: "#a1a1aa", fontSize: 15, lineHeight: 1.6, margin: "0 0 14px" }}>{p.excerpt}</p>
              <span style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600 }}>Read the guide →</span>
            </Link>
          ))}
        </div>

        <p style={{ color: "#52525b", fontSize: 13, margin: "48px 0 0" }}>
          More guides coming soon. Last updated {formatDate(posts[0].dateModified)}.
        </p>
      </main>
    </div>
  );
}
