import PublicProfileClient from "./PublicProfileClient";

// Static export: emit one placeholder shell (/u/_/). vercel.json rewrites
// /u/<handle> to it, and the client reads the real handle from the URL.
export function generateStaticParams() {
  return [{ username: "_" }];
}

export default function PublicProfilePage() {
  return <PublicProfileClient />;
}
