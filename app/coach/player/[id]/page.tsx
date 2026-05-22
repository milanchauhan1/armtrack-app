import PlayerDetailClient from './PlayerDetailClient';

// Static export requires at least one path for dynamic segments.
// At runtime the client reads the real id from the URL.
export async function generateStaticParams() {
  return [{ id: '_' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerDetailClient params={{ id }} />;
}
