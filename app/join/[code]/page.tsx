import JoinClient from './JoinClient';

// Static export requires at least one path for dynamic segments.
// At runtime the client reads the real code from the URL.
export async function generateStaticParams() {
  return [{ code: '_' }];
}

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <JoinClient code={code} />;
}
