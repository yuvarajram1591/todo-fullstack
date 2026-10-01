'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Me = { userId: string; email: string };

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setMe)
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!me) return <main className="flex min-h-screen items-center justify-center">Loading...</main>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Logged in as: {me.email}</p>
      <button onClick={handleLogout} className="rounded border p-2">
        Log out
      </button>
    </main>
  );
}