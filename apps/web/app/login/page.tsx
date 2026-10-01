"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.accessToken);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Log In</h1>
      <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded border p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded border p-2"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded bg-black p-2 text-white">
          Log In
        </button>
      </form>

      <Link href="/forgot-password" className="text-sm underline">
        Forgot password?
      </Link>

      <a
        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
        className="rounded border p-2 text-center"
      >
        Continue with Google
      </a>
    </main>
  );
}
