import JoinClient from './JoinClient';

export async function generateStaticParams() {
  return [{ code: '_' }];
}

export default function Page() {
  return <JoinClient />;
}
