'use client'; // needed because we use useState/useEffect (client-side hooks)

import { useEffect, useState } from 'react';

// Matches the JSON shape your NestJS /health endpoint returns
type HealthResponse = {
  status: string;
  details?: {
    database?: { status: string };
  };
};

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Calls your NestJS backend directly
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setError('Could not reach backend'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Todo App — Web</h1>

      {error && <p className="text-red-500">{error}</p>}

      {health && (
        <div className="rounded border p-4 text-sm">
          <p>Overall status: <strong>{health.status}</strong></p>
          <p>
            Database:{' '}
            <strong>{health.details?.database?.status ?? 'unknown'}</strong>
          </p>
        </div>
      )}
    </main>
  );
}