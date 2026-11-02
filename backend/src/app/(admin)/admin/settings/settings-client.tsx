'use client';

import { useState } from 'react';
import {
  Settings,
  CreditCard,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface SettingsClientProps {
  initialSettings: Record<string, string>;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>({
    platform_name: initialSettings.platform_name || 'Webphiser Education System',
    support_email: initialSettings.support_email || 'support@d3vx.in',
    support_phone: initialSettings.support_phone || '+91 9876543210',
    currency: initialSettings.currency || 'INR',
    razorpay_key_id: initialSettings.razorpay_key_id || 'rzp_test_mock_edu9988',
    razorpay_key_secret: initialSettings.razorpay_key_secret || 'mock_secret_key_edu_2026',
    max_devices: initialSettings.max_devices || '2',
    enable_guest_access: initialSettings.enable_guest_access || 'true',
  });

  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Platform Settings & Gateway Integration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure system parameters, Razorpay API credentials, and student device restrictions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Payment Gateway"
          value="Razorpay Live"
          subtitle="Test / Sandbox active"
          icon={CreditCard}
          colorScheme="gold"
        />
        <KpiCard
          title="Security Enforcement"
          value="Strict RBAC"
          subtitle="JWT + Bcrypt auth"
          icon={Shield}
          colorScheme="emerald"
        />
        <KpiCard
          title="Device Limit"
          value={`${settings.max_devices} Devices`}
          subtitle="Per student login session"
          icon={Lock}
          colorScheme="purple"
        />
        <KpiCard
          title="Billing Currency"
          value={settings.currency}
          subtitle="Indian Rupee (INR ₹)"
          icon={Globe}
          colorScheme="blue"
        />
      </div>

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General Information Card */}
        <div className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#e0a028]" />
              <span>General Platform Information</span>
            </h3>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Platform Brand Name
              </label>
              <input
                type="text"
                value={settings.platform_name}
                onChange={(e) => handleChange('platform_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Billing Currency Code
              </label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Support Helpline / WhatsApp
              </label>
              <input
                type="tel"
                value={settings.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Integration */}
        <div className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 shadow-lg space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#e0a028]" />
              <span>Razorpay Payment Gateway API Keys</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Obtained from Razorpay Dashboard under Settings → API Keys.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={settings.razorpay_key_id}
                onChange={(e) => handleChange('razorpay_key_id', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Razorpay Key Secret
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecret ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                value={settings.razorpay_key_secret}
                onChange={(e) => handleChange('razorpay_key_secret', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Policies */}
        <div className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 shadow-lg space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#e0a028]" />
              <span>Student Access & DRM Security</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Allowed Devices Per Student Login
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.max_devices}
                onChange={(e) => handleChange('max_devices', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="guestAccess"
                checked={settings.enable_guest_access === 'true'}
                onChange={(e) =>
                  handleChange('enable_guest_access', e.target.checked ? 'true' : 'false')
                }
                className="w-4 h-4 rounded border-white/10 bg-[#040e22] text-[#e0a028] focus:ring-[#e0a028]"
              />
              <label htmlFor="guestAccess" className="text-xs text-slate-300">
                Allow guest preview mode on free lessons and standalone quizzes
              </label>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Platform Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
