/**
 * @file page.tsx
 * @module owner-dashboard/app/(dashboard)/settings
 * @description Platform settings page
 * @author AmanVatsSharma
 * @created 2026-05-11
 */

import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          Platform Settings
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Configure AI providers, SMS/WhatsApp, and feature flags
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Providers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold mb-4">AI Providers</h3>
            <SettingsForm category="ai" />
          </div>

          <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold mb-4">SMS & WhatsApp</h3>
            <SettingsForm category="sms" />
          </div>

          <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
            <SettingsForm category="features" />
          </div>
        </div>

        {/* Admin Users */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold mb-4">Admin Users</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[hsl(var(--secondary))]">
                <p className="font-medium">admin@urbannest.ai</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Super Admin</p>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]">
              Invite Admin
            </button>
          </div>

          <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-semibold mb-4">Audit Logs</h3>
            <a
              href="/audit-logs"
              className="block px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-center hover:bg-[hsl(var(--secondary))]"
            >
              View All Logs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}