import dynamic from 'next/dynamic';

// Disable SSR — login page uses client-only auth context and browser APIs.
const LoginClient = dynamic(() => import('./LoginClient'), { ssr: false });

export default function LoginPage() {
  return <LoginClient />;
}
