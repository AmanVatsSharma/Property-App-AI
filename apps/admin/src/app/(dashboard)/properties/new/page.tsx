"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { gqlCreateProperty } from "@/lib/graphql-client";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setError("Invalid price");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await gqlCreateProperty(
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
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">New property</h1>
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
              placeholder="e.g. ready"
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--admin-muted)] mb-1">Listing for</label>
            <input
              type="text"
              value={form.listingFor}
              onChange={(e) => setForm((f) => ({ ...f, listingFor: e.target.value }))}
              placeholder="e.g. sale"
              className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-sidebar)] px-3 py-2 text-[var(--admin-text)]"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded px-4 py-2 bg-[var(--admin-accent)] text-white font-medium hover:bg-[var(--admin-accent-hover)] disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded px-4 py-2 border border-[var(--admin-border)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
