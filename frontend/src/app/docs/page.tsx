import dynamic from 'next/dynamic';

const DocsClient = dynamic(() => import('./DocsClient'), { ssr: false });

export default function DocsPage() {
  return <DocsClient />;
}
