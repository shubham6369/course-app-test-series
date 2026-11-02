'use client';

import { useState } from 'react';
import {
  Bot,
  Sliders,
  Sparkles,
  Save,
  Clock,
  MessageSquare,
  HelpCircle,
  Cpu,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface AiConfigData {
  id: number;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface AuditLogItem {
  id: number;
  studentId: number | null;
  query: string;
  response: string;
  suggestions: string | null;
  createdAt: string | Date;
}

interface AiClientProps {
  initialConfig: AiConfigData;
  initialLogs: AuditLogItem[];
}

export function AiClient({ initialConfig, initialLogs }: AiClientProps) {
  const [config, setConfig] = useState<AiConfigData>(initialConfig);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialLogs);

  // Form State
  const [systemPrompt, setSystemPrompt] = useState(initialConfig.systemPrompt);
  const [model, setModel] = useState(initialConfig.model);
  const [temperature, setTemperature] = useState(initialConfig.temperature);
  const [maxTokens, setMaxTokens] = useState(initialConfig.maxTokens);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          model,
          temperature,
          maxTokens,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setConfig(data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving AI config:', err);
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
            <span>AI Academic Tutor Studio & Telemetry</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live Engine
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tune system prompts, temperature hyperparameters, token budgets, and audit student dialogue sessions.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Inference Model"
          value={config.model}
          subtitle="Production LLM"
          icon={Bot}
          colorScheme="purple"
        />
        <KpiCard
          title="Sampling Temp"
          value={config.temperature}
          subtitle="Creativity / Determinism"
          icon={Sliders}
          colorScheme="gold"
        />
        <KpiCard
          title="Max Token Cap"
          value={config.maxTokens}
          subtitle="Output window budget"
          icon={Cpu}
          colorScheme="blue"
        />
        <KpiCard
          title="Logged Dialogues"
          value={auditLogs.length}
          subtitle="Student inquiries stored"
          icon={MessageSquare}
          colorScheme="emerald"
        />
      </div>

      {/* Main Grid: Config Form & Live Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prompt & Model Configuration */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">
                  Tutor Behavioral Instructions & Persona
                </h3>
                <p className="text-xs text-slate-400">
                  Global system prompt prepended to student chat completions.
                </p>
              </div>
            </div>

            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Core System Prompt *
              </label>
              <textarea
                rows={6}
                required
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] leading-relaxed font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  LLM Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Accurate)</option>
                  <option value="gpt-4o">gpt-4o (Deep Reasoning)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Temperature ({temperature})
                  </label>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#e0a028] cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Lower = factual & deterministic
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Max Output Tokens
                </label>
                <input
                  type="number"
                  min="256"
                  max="4096"
                  step="128"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Hyperparameters...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save AI Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Academic Guardrails & Safety */}
        <div className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 text-[#e0a028] font-bold text-sm mb-3">
              <Bot className="w-4 h-4" />
              <span>Academic Integrity Guardrails</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The AI Tutor is tuned to assist students preparing for competitive entrance examinations (NEET UG, JEE Main & Advanced).
            </p>

            <div className="mt-4 space-y-2.5 text-xs text-slate-400">
              <div className="p-2.5 rounded-xl bg-[#040e22] border border-white/5 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Encourages first-principles derivations and Socratic questions.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#040e22] border border-white/5 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Strictly denies non-educational / off-topic inquiries.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#040e22] border border-white/5 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Generates 3 contextual follow-up exploration suggestions.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Latency SLA: ~450ms</span>
            <span className="text-emerald-400 font-mono">100% Online</span>
          </div>
        </div>
      </div>

      {/* AI Audit Logs Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#e0a028]" />
            <h3 className="font-semibold text-sm text-white">
              Student Interaction Audit Trail
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Latest {auditLogs.length} inquiries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Query</th>
                <th className="py-3 px-4 font-semibold">AI Generated Response</th>
                <th className="py-3 px-4 font-semibold">Follow-Up Suggestions</th>
                <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No student AI chat logs recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  let parsedSuggestions: string[] = [];
                  try {
                    if (log.suggestions) parsedSuggestions = JSON.parse(log.suggestions);
                  } catch {
                    parsedSuggestions = [];
                  }

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs font-medium text-white">
                        <p className="line-clamp-2">{log.query}</p>
                      </td>
                      <td className="py-3.5 px-4 max-w-md text-slate-300">
                        <p className="line-clamp-2">{log.response}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {parsedSuggestions.slice(0, 2).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 truncate"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
