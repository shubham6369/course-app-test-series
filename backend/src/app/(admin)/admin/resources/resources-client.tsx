'use client';

import { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Download,
  ExternalLink,
  HardDrive,
  FileCode,
  Video,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface ResourceItem {
  id: number;
  title: string;
  type: string;
  fileUrl: string;
  fileSize: string;
  createdAt: string | Date;
}

interface ResourcesClientProps {
  initialResources: ResourceItem[];
}

export function ResourcesClient({ initialResources }: ResourcesClientProps) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');

  const filteredResources = resources.filter((res) =>
    res.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPdfs = resources.filter((r) => r.type.toLowerCase() === 'pdf').length;
  const totalVideos = resources.filter((r) => r.type.toLowerCase() === 'video').length;

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, fileUrl, fileSize }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResources([data.data, ...resources]);
        setIsModalOpen(false);
        setTitle('');
        setFileUrl('');
        setFileSize('2.4 MB');
      }
    } catch (err) {
      console.error('Error creating resource:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/resources?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setResources(resources.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Notes & Study Resources
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage downloadable PDF sheets, formulas, syllabus bulletins and video materials.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resource</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Documents"
          value={resources.length}
          subtitle="Available for students"
          icon={FileText}
          colorScheme="gold"
        />
        <KpiCard
          title="PDF Notes"
          value={totalPdfs}
          subtitle="Bulletins & handbooks"
          icon={FileCode}
          colorScheme="blue"
        />
        <KpiCard
          title="Video Notes"
          value={totalVideos}
          subtitle="Supplementary clips"
          icon={Video}
          colorScheme="purple"
        />
        <KpiCard
          title="Storage Allocated"
          value="~16.8 MB"
          subtitle="AWS S3 / CDN Cloud"
          icon={HardDrive}
          colorScheme="emerald"
        />
      </div>

      {/* Filter and Table Container */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, formulas, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredResources.length} files
          </span>
        </div>

        {/* Resources Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Resource Title</th>
                <th className="py-3.5 px-4 font-semibold">Format</th>
                <th className="py-3.5 px-4 font-semibold">File Size</th>
                <th className="py-3.5 px-4 font-semibold">Uploaded Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No resources found matching search query.
                  </td>
                </tr>
              ) : (
                filteredResources.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e0a028]/10 border border-[#e0a028]/30 flex items-center justify-center text-[#e0a028] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-sm">
                            {item.fileUrl}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {item.fileSize}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Link"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete Resource"
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Upload New Study Resource
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add study material links, formula handbooks, or video assets.
            </p>

            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Formula Sheet 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Resource Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="video">Video Attachment</option>
                    <option value="doc">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    File Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.5 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Document / Stream URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.d3vx.in/files/document.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Resource</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
