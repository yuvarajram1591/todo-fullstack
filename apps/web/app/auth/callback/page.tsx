'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [searchParams, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Signing you in...</p>
    </main>
  );
}