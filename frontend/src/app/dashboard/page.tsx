import dynamic from 'next/dynamic';

// Disable SSR entirely for the dashboard — it's a fully client-side authenticated page.
// This is the reliable fix for the "useSearchParams Suspense boundary" build error in Next.js 14.
const DashboardClient = dynamic(() => import('./DashboardClient'), { ssr: false });

export default function DashboardPage() {
  return <DashboardClient />;
}
