// Server component — exports dynamic config so Next.js skips static prerendering
export const dynamic = 'force-dynamic';

import LoginClient from './LoginClient';

export default function LoginPage() {
  return <LoginClient />;
}
