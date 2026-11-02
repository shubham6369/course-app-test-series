'use client';

import { useState } from 'react';
import {
  Palette,
  Sparkles,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Shield,
  Layers,
  Eye,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface SetupClientProps {
  initialConfig: Record<string, string>;
}

export function SetupClient({ initialConfig }: SetupClientProps) {
  const [config, setConfig] = useState<Record<string, string>>({
    app_name: initialConfig.app_name || 'Webphiser Education System',
    tagline:
      initialConfig.tagline ||
      'Premier Computer-Based Testing & Learning Platform for NEET & JEE',
    logo_url:
      initialConfig.logo_url || 'https://edu.d3vx.in/assets/logo.png',
    brand_color: initialConfig.brand_color || '#09214b',
    brand_accent: initialConfig.brand_accent || '#e0a028',
    brand_dark: initialConfig.brand_dark || '#061432',
    brand_canvas: initialConfig.brand_canvas || '#040e22',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving branding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Branding, Identity & Theme Setup</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
              White-Label
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personalize your institution's name, brand palette tokens, logos, and portal theme styling.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Theme"
          value="Webphiser Pro"
          subtitle="Midnight Gold Edition"
          icon={Palette}
          colorScheme="gold"
        />
        <KpiCard
          title="Accent Accent"
          value={config.brand_accent}
          subtitle="CTA buttons & highlights"
          icon={Sparkles}
          colorScheme="purple"
        />
        <KpiCard
          title="Primary Brand"
          value={config.brand_color}
          subtitle="Navy header & cards"
          icon={Layers}
          colorScheme="blue"
        />
        <KpiCard
          title="White-Label Status"
          value="Enterprise Ready"
          subtitle="Custom domain & assets"
          icon={Shield}
          colorScheme="emerald"
        />
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 space-y-5 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#e0a028]" />
              <span>Identity & Color Tokens</span>
            </h3>

            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Branding Saved</span>
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Institution / App Name *
              </label>
              <input
                type="text"
                required
                value={config.app_name}
                onChange={(e) => handleChange('app_name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Site / App Logo URL
              </label>
              <input
                type="url"
                value={config.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
              />
            </div>

            {/* Color Pickers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Brand Primary
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.brand_color}
                    onChange={(e) => handleChange('brand_color', e.target.value)}
                    className="w-9 h-9 rounded-xl border border-white/20 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.brand_color}
                    onChange={(e) => handleChange('brand_color', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#040e22] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Accent Gold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.brand_accent}
                    onChange={(e) => handleChange('brand_accent', e.target.value)}
                    className="w-9 h-9 rounded-xl border border-white/20 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.brand_accent}
                    onChange={(e) => handleChange('brand_accent', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#040e22] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Surface Dark
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.brand_dark}
                    onChange={(e) => handleChange('brand_dark', e.target.value)}
                    className="w-9 h-9 rounded-xl border border-white/20 bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.brand_dark}
                    onChange={(e) => handleChange('brand_dark', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#040e22] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Identity...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Brand Tokens</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Col: Live Theme Preview Card */}
        <div className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
              <Eye className="w-4 h-4 text-[#e0a028]" />
              <span>Real-Time Component Preview</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Here is how your brand colors render inside course cards and buttons:
            </p>

            {/* Mock Card with dynamic inline styles */}
            <div
              className="rounded-2xl border p-4 shadow-xl space-y-3"
              style={{
                backgroundColor: config.brand_dark,
                borderColor: `${config.brand_accent}40`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: `${config.brand_accent}25`,
                    color: config.brand_accent,
                  }}
                >
                  PREVIEW BADGE
                </span>
                <span className="text-[10px] text-slate-400">v2.4 Ready</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {config.app_name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {config.tagline}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-[1.02]"
                  style={{
                    backgroundColor: config.brand_accent,
                    color: config.brand_dark,
                  }}
                >
                  Sample CTA Button
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-500">
            Preview dynamically bound to reactive state.
          </div>
        </div>
      </div>
    </div>
  );
}
