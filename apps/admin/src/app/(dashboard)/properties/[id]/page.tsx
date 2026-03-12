"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import {
  gqlProperty,
  gqlUpdateProperty,
  gqlDeleteProperty,
  type ApiProperty,
} from "@/lib/graphql-client";

export default function PropertyEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<ApiProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    type: "apartment",
    bedrooms: "0",
    bathrooms: "0",
    areaSqft: "",
    status: "",
    listingFor: "",
  });

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    gqlProperty(id, token)
      .then((p) => {
        if (p) {
          setProperty(p);
          setForm({
            title: p.title,
            location: p.location,
            price: String(p.price),
            type: p.type || "apartment",
            bedrooms: String(p.bedrooms ?? 0),
            bathrooms: String(p.bathrooms ?? 0),
            areaSqft: p.areaSqft != null ? String(p.areaSqft) : "",
            status: p.status ?? "",
            listingFor: p.listingFor ?? "",
          });
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !id) return;
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setError("Invalid price");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await gqlUpdateProperty(
        id,
        {
          title: form.title.trim(),
          location: form.location.trim(),
          price,
          type: form.type || "apartment",
          bedrooms: parseInt(form.bedrooms, 10) || 0,
          bathrooms: parseInt(form.bathrooms, 10) || 0,
          areaSqft: form.areaSqft ? parseFloat(form.areaSqft) : undefined,
          status: form.status || undefined,
          listingFor: form.listingFor || undefined,
        },
        token
      );
      router.push("/properties");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this property?")) return;
    const token = getToken();
    if (!token || !id) return;
    setDeleting(true);
    try {
      await gqlDeleteProperty(id, token);
      router.push("/properties");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-[var(--admin-muted)]">Loading…</p>;
  }

  if (error && !property) {
    return (
      <div>
        <p className="text-red-400">{error}</p>
        <Link href="/properties" className="text-[var(--admin-accent)] hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div>
        <p className="text-[var(--admin-muted)]">Property not found.</p>
        <Link href="/properties" className="text-[var(--admin-accent)] hover:underline mt-2 inline-block">
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit property</h1>
        <Link href="/properties" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-text)]">
          ← Back to list
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--admin-muted)] mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--admin-muted)] mb-1">Location *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
            className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--admin-muted)] mb-1">Price (₹) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
            className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Bedrooms</label>
            <input
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Bathrooms</label>
            <input
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Area (sq ft)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.areaSqft}
              onChange={(e) => setForm((f) => ({ ...f, areaSqft: e.target.value }))}
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Status</label>
            <input
              type="text"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Listing for</label>
            <input
              type="text"
              value={form.listingFor}
              onChange={(e) => setForm((f) => ({ ...f, listingFor: e.target.value }))}
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2 items-center">
          <button
            type="submit"
            disabled={saving}
            className="rounded px-4 py-2 bg-[var(--admin-accent)] text-white font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded px-4 py-2 border border-[var(--admin-border)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50 ml-auto"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
