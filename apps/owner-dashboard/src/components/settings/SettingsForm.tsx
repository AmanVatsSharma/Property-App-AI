/**
 * @file SettingsForm.tsx
 * @module owner-dashboard/components/settings
 * @description Settings form component
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

"use client";

import { useState } from "react";

interface SettingsFormProps {
  category: "ai" | "sms" | "features";
}

export function SettingsForm({ category }: SettingsFormProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save settings to API
    setTimeout(() => setSaving(false), 1000);
  };

  if (category === "ai") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <select className="w-full px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
            <option value="google">Google Gemini</option>
            <option value="openai">OpenAI GPT</option>
            <option value="anthropic">Anthropic Claude</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input type="password" placeholder="Enter API key" className="w-full px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]" />
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    );
  }

  if (category === "sms") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">SMS Provider</label>
          <select className="w-full px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
            <option value="stub">Stub (Dev)</option>
            <option value="twilio">Twilio</option>
            <option value="msg91">MSG91</option>
            <option value="zavu">Zavu</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="whatsapp-enabled" className="rounded" />
          <label htmlFor="whatsapp-enabled">Enable WhatsApp OTP</label>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    );
  }

  // features
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>AI Property Scoring</span>
        <input type="checkbox" defaultChecked className="rounded" />
      </div>
      <div className="flex items-center justify-between">
        <span>WhatsApp Authentication</span>
        <input type="checkbox" defaultChecked className="rounded" />
      </div>
      <div className="flex items-center justify-between">
        <span>Price Forecasting</span>
        <input type="checkbox" defaultChecked className="rounded" />
      </div>
      <div className="flex items-center justify-between">
        <span>RERA Verification</span>
        <input type="checkbox" className="rounded" />
      </div>
    </div>
  );
}