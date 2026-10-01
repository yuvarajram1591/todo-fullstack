"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Signup failed");
      return;
    }

    // Save the token and redirect to a protected page
    localStorage.setItem("token", data.accessToken);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex w-72 flex-col gap-3">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded border p-2"
          required
        />
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
          placeholder="Password (min 8 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded border p-2"
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" className="rounded bg-black p-2 text-white">
          Sign Up
        </button>
      </form>

      {/* Google OAuth entry point — full page redirect, not fetch */}
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
        className="rounded border p-2 text-center"
      >
        Continue with Google
      </a>
    </main>
  );
}
