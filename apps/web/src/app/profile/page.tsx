/**
 * @file page.tsx
 * @module app/profile
 * @description User profile page — account management and quick links.
 * @author BharatERP
 * @created 2025-03-19
 */

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = buildMetadata({
  title: "My Profile",
  description: "Manage your UrbanNest profile and preferences.",
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return (
    <div className="page-wrap">
      <div className="page-hero">
        <div className="eyebrow">My Account</div>
        <h1 className="h1">
          My <em className="teal">Profile</em>
        </h1>
      </div>
      <ProfileClient />
    </div>
  );
}
