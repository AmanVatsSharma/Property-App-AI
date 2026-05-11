/**
 * File:        src/app/page.tsx
 * Module:      Owner Dashboard — Root redirect
 * Purpose:     Redirect root to /dashboard
 *
 * Author:      AmanVatsSharma
 * Last-updated: 2026-05-12
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
