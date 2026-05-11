/**
 * @file page.tsx
 * @module owner-dashboard/app/login
 * @description Login page for platform owner
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (phone: string, otp: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });

      if (!response.ok) {
        throw new Error("Invalid OTP");
      }

      const data = await response.json();

      // Store token
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Owner Dashboard
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Sign in to manage UrbanNest.ai
          </p>
        </div>

        <LoginForm onLogin={handleLogin} error={error} />

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
          >
            Back to website
          </a>
        </div>
      </div>
    </div>
  );
}