'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BadgePercent,
  Building2,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Globe,
  Mail,
  Save,
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
  Wrench,
} from 'lucide-react';
import { useSystemSettings, useUpdateSystemSettings } from '@/features/settings/queries/settings.queries';
import type { SystemSettings, UpdateSettingsPayload } from '@/features/settings/types/settings.types';
import { useAuthStore } from '@/stores/auth.store';

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-dash-border)] bg-[var(--color-dash-card)] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[var(--color-dash-border)] px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <Icon size={16} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/40">{description}</p>
        </div>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

const inputCls =
  'h-10 w-full rounded-xl border border-[var(--color-dash-border)] bg-[var(--color-dash-input,#1a1a2e)] px-3 text-sm text-white outline-none focus:border-emerald-500/60 transition-colors placeholder:text-white/20';

const selectCls =
  'h-10 w-full rounded-xl border border-[var(--color-dash-border)] bg-[var(--color-dash-input,#1a1a2e)] px-3 text-sm text-white outline-none focus:border-emerald-500/60 transition-colors';

function Toggle({
  checked,
  onChange,
  label,
  description,
  danger,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  danger?: boolean;
}) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--color-dash-border)] bg-[var(--color-dash-card)] px-4 py-3 transition-colors hover:border-white/15"
      onClick={() => onChange(!checked)}
    >
      <div className="min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</p>
        {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
      </div>
      {checked ? (
        <ToggleRight size={24} className={danger ? 'shrink-0 text-red-400' : 'shrink-0 text-emerald-400'} />
      ) : (
        <ToggleLeft size={24} className="shrink-0 text-white/20" />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const { data: settings, isLoading } = useSystemSettings();
  const update = useUpdateSystemSettings();

  const [form, setForm] = useState<UpdateSettingsPayload | null>(null);
  const [dirty, setDirty] = useState(false);

  // Initialise form from fetched settings
  useEffect(() => {
    if (settings && !form) {
      setForm({
        platformName:         settings.platformName,
        platformEmail:        settings.platformEmail,
        supportEmail:         settings.supportEmail,
        commissionRate:       settings.commissionRate,
        commissionType:       settings.commissionType,
        flatCommissionAmount: settings.flatCommissionAmount,
        commissionCurrency:   settings.commissionCurrency,
        minTransactionAmount: settings.minTransactionAmount,
        maxTransactionAmount: settings.maxTransactionAmount,
        escrowEnabled:        settings.escrowEnabled,
        autoApproveListings:  settings.autoApproveListings,
        maintenanceMode:      settings.maintenanceMode,
        allowGuestBrowsing:   settings.allowGuestBrowsing,
      });
    }
  }, [settings, form]);

  function set<K extends keyof UpdateSettingsPayload>(key: K, value: UpdateSettingsPayload[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty(true);
  }

  function handleSave() {
    if (!form || !dirty) return;
    update.mutate(form, { onSuccess: () => setDirty(false) });
  }

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  const readOnly = !isSuperAdmin;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="text-white/70">System Settings</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-white">System Settings</h1>
          <p className="mt-1 text-sm text-white/40">
            Platform-wide configuration. Changes take effect immediately.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={handleSave}
            disabled={!dirty || update.isPending}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
          >
            <Save size={15} />
            {update.isPending ? 'Saving…' : 'Save changes'}
          </button>
        )}
      </div>

      {readOnly && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle size={15} className="shrink-0" />
          You have read-only access. Only Super Admins can modify settings.
        </div>
      )}

      {/* ── Commission ─────────────────────────────────────────────────────── */}
      <Section
        icon={BadgePercent}
        title="Commission & Fees"
        description="Revenue model for buy/sell and lease transactions"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Commission type">
            <select
              value={form.commissionType}
              disabled={readOnly}
              onChange={(e) => set('commissionType', e.target.value as any)}
              className={selectCls}
            >
              <option value="percentage">Percentage of transaction</option>
              <option value="flat">Flat fee per transaction</option>
            </select>
          </Field>

          {form.commissionType === 'percentage' ? (
            <Field
              label="Commission rate (%)"
              hint="e.g. 2.5 means the platform keeps 2.5% of every transaction"
            >
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.commissionRate}
                  disabled={readOnly}
                  onChange={(e) => set('commissionRate', Number(e.target.value))}
                  className={inputCls}
                  placeholder="2.5"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/30">%</span>
              </div>
            </Field>
          ) : (
            <Field
              label="Flat fee amount"
              hint="Fixed amount charged per completed transaction"
            >
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.flatCommissionAmount}
                disabled={readOnly}
                onChange={(e) => set('flatCommissionAmount', Number(e.target.value))}
                className={inputCls}
                placeholder="500"
              />
            </Field>
          )}
        </div>

        <Field label="Commission currency">
          <select
            value={form.commissionCurrency}
            disabled={readOnly}
            onChange={(e) => set('commissionCurrency', e.target.value)}
            className={`${selectCls} w-40`}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="ETB">ETB</option>
          </select>
        </Field>

        {/* Preview */}
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/60">
            Commission preview
          </p>
          <p className="mt-2 text-sm text-white/70">
            On a{' '}
            <span className="font-semibold text-white">
              {form.commissionCurrency} 100,000
            </span>{' '}
            transaction, the platform earns{' '}
            <span className="font-semibold text-emerald-400">
              {form.commissionCurrency}{' '}
              {form.commissionType === 'percentage'
                ? ((form.commissionRate ?? 0) * 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : (form.flatCommissionAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      </Section>

      {/* ── Transaction limits ─────────────────────────────────────────────── */}
      <Section
        icon={DollarSign}
        title="Transaction Limits"
        description="Min/max allowed transaction values (0 = no limit)"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum transaction amount" hint="In the commission currency">
            <input
              type="number"
              min={0}
              step="any"
              value={form.minTransactionAmount}
              disabled={readOnly}
              onChange={(e) => set('minTransactionAmount', Number(e.target.value))}
              className={inputCls}
              placeholder="0"
            />
          </Field>
          <Field label="Maximum transaction amount" hint="Set to 0 to disable the cap">
            <input
              type="number"
              min={0}
              step="any"
              value={form.maxTransactionAmount}
              disabled={readOnly}
              onChange={(e) => set('maxTransactionAmount', Number(e.target.value))}
              className={inputCls}
              placeholder="0"
            />
          </Field>
        </div>
      </Section>

      {/* ── Platform identity ──────────────────────────────────────────────── */}
      <Section
        icon={Building2}
        title="Platform Identity"
        description="Name and contact addresses shown to users"
      >
        <Field label="Platform name">
          <input
            type="text"
            value={form.platformName}
            disabled={readOnly}
            onChange={(e) => set('platformName', e.target.value)}
            className={inputCls}
            placeholder="EstateLedger"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Platform email">
            <input
              type="email"
              value={form.platformEmail}
              disabled={readOnly}
              onChange={(e) => set('platformEmail', e.target.value)}
              className={inputCls}
              placeholder="platform@example.com"
            />
          </Field>
          <Field label="Support email">
            <input
              type="email"
              value={form.supportEmail}
              disabled={readOnly}
              onChange={(e) => set('supportEmail', e.target.value)}
              className={inputCls}
              placeholder="support@example.com"
            />
          </Field>
        </div>
      </Section>

      {/* ── Feature flags ─────────────────────────────────────────────────── */}
      <Section
        icon={Settings}
        title="Feature Flags"
        description="Enable or disable platform capabilities"
      >
        <div className="space-y-3">
          <Toggle
            checked={form.escrowEnabled ?? true}
            onChange={(v) => set('escrowEnabled', v)}
            label="Escrow enabled"
            description="Allow on-chain escrow for lease and purchase transactions"
          />
          <Toggle
            checked={form.autoApproveListings ?? false}
            onChange={(v) => set('autoApproveListings', v)}
            label="Auto-approve listings"
            description="Publish listings immediately without admin review"
          />
          <Toggle
            checked={form.allowGuestBrowsing ?? true}
            onChange={(v) => set('allowGuestBrowsing', v)}
            label="Guest browsing"
            description="Allow unauthenticated users to browse listings"
          />
        </div>
      </Section>

      {/* ── Danger zone ───────────────────────────────────────────────────── */}
      <Section
        icon={Shield}
        title="Danger Zone"
        description="Settings that affect all users immediately"
      >
        <Toggle
          checked={form.maintenanceMode ?? false}
          onChange={(v) => set('maintenanceMode', v)}
          label="Maintenance mode"
          description="Take the platform offline for all non-admin users"
          danger
        />
        {form.maintenanceMode && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-300">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>
              <strong>Warning:</strong> Enabling maintenance mode will block all marketplace access for tenants and property owners.
            </span>
          </div>
        )}
      </Section>

      {/* Save footer */}
      {isSuperAdmin && dirty && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle2 size={15} />
            You have unsaved changes
          </div>
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            <Save size={15} />
            {update.isPending ? 'Saving…' : 'Save all changes'}
          </button>
        </div>
      )}
    </div>
  );
}
