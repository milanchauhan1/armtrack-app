import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getAllPosts,
  getPostBySlug,
  postUrl,
  formatDate,
  PostBody,
} from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: "article",
      url: postUrl(post.slug),
      title: post.title,
      description: post.description,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getAllPosts().filter((p) => p.slug !== post.slug);

  const graph: object[] = [
    {
      "@type": "BlogPosting",
      "@id": `${postUrl(post.slug)}#article`,
      headline: post.title,
      description: post.description,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: { "@type": "Person", name: post.author },
      publisher: { "@id": "https://armtrack.app/#organization" },
      mainEntityOfPage: postUrl(post.slug),
      image: "https://armtrack.app/opengraph-image",
      keywords: post.keywords.join(", "),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://armtrack.app/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: "https://armtrack.app/blog/" },
        { "@type": "ListItem", position: 3, name: post.title, item: postUrl(post.slug) },
      ],
    },
  ];
  if (post.faq && post.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

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

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 100px" }}>
        {/* Breadcrumb / back */}
        <Link
          href="/blog/"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#71717a", fontSize: 14, textDecoration: "none", marginBottom: 28 }}
        >
          <ArrowLeft size={15} /> All guides
        </Link>

        {/* Title block */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: "#3B82F6", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {post.category}
          </span>
          <span style={{ color: "#3f3f46" }}>•</span>
          <span style={{ color: "#71717a", fontSize: 13 }}>{post.readingMinutes} min read</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, margin: "0 0 18px" }}>
          {post.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 28, marginBottom: 36, borderBottom: "1px solid #1a1a1a" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              background: "linear-gradient(145deg, #3B82F6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {post.author.charAt(0)}
          </div>
          <div>
            <p style={{ color: "#e5e5e5", fontSize: 13.5, fontWeight: 600, margin: 0 }}>{post.author}</p>
            <p style={{ color: "#71717a", fontSize: 12.5, margin: 0 }}>Updated {formatDate(post.dateModified)}</p>
          </div>
        </div>

        {/* Body */}
        <article>
          <PostBody blocks={post.blocks} />
        </article>

        {/* FAQ */}
        {post.faq && post.faq.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 18px" }}>
              Frequently asked questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {post.faq.map((f, i) => (
                <div key={i} style={{ background: "#0d0d0d", border: "1px solid #1c1c1c", borderRadius: 14, padding: "18px 20px" }}>
                  <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{f.q}</p>
                  <p style={{ color: "#a1a1aa", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section style={{ marginTop: 56, paddingTop: 36, borderTop: "1px solid #1a1a1a" }}>
            <p style={{ color: "#71717a", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 18px" }}>
              Keep reading
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    background: "#0d0d0d",
                    border: "1px solid #1c1c1c",
                    borderRadius: 14,
                    padding: "18px 20px",
                  }}
                >
                  <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{p.title}</p>
                  <span style={{ color: "#60a5fa", fontSize: 13.5, fontWeight: 600 }}>Read the guide →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
