'use client';

import { useState } from 'react';
import {
  BookMarked,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface EbookItem {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  coverUrl: string | null;
  pdfUrl: string;
  pageCount: number;
  fileSize: string;
  isFree: boolean;
  createdAt: string | Date;
}

interface EbooksClientProps {
  initialEbooks: EbookItem[];
}

export function EbooksClient({ initialEbooks }: EbooksClientProps) {
  const [ebooks, setEbooks] = useState<EbookItem[]>(initialEbooks);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pageCount, setPageCount] = useState('150');
  const [fileSize, setFileSize] = useState('12.5 MB');
  const [isFree, setIsFree] = useState(true);

  const filteredEbooks = ebooks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(search.toLowerCase()))
  );

  const freeCount = ebooks.filter((b) => b.isFree).length;
  const premiumCount = ebooks.length - freeCount;
  const totalPages = ebooks.reduce((acc, b) => acc + (b.pageCount || 0), 0);

  const handleCreateEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pdfUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/ebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author: author || 'Academic Panel',
          description,
          coverUrl:
            coverUrl ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
          pdfUrl,
          pageCount,
          fileSize,
          isFree,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEbooks([data.data, ...ebooks]);
        setIsModalOpen(false);
        setTitle('');
        setAuthor('');
        setDescription('');
        setCoverUrl('');
        setPdfUrl('');
        setPageCount('150');
        setFileSize('12.5 MB');
        setIsFree(true);
      }
    } catch (err) {
      console.error('Error creating ebook:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this e-book?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/ebooks?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEbooks(ebooks.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting ebook:', err);
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
            Digital E-Books & Reference Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curate NCERT annotations, solved yearbooks, and subject theory guides for students.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New E-Book</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Publications"
          value={ebooks.length}
          subtitle="Cataloged in library"
          icon={BookMarked}
          colorScheme="gold"
        />
        <KpiCard
          title="Free E-Books"
          value={freeCount}
          subtitle="Accessible to all students"
          icon={BookOpen}
          colorScheme="emerald"
        />
        <KpiCard
          title="Premium Guides"
          value={premiumCount}
          subtitle="Course / Test package locked"
          icon={Sparkles}
          colorScheme="purple"
        />
        <KpiCard
          title="Total Pages"
          value={totalPages}
          subtitle="Curated study content"
          icon={Layers}
          colorScheme="blue"
        />
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search e-books by title, author, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredEbooks.length} publications
        </span>
      </div>

      {/* E-Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredEbooks.map((book) => (
          <div
            key={book.id}
            className="rounded-2xl border border-white/10 bg-[#061432]/70 backdrop-blur-md overflow-hidden flex flex-col hover:border-[#e0a028]/40 transition-all group shadow-lg"
          >
            {/* Book Cover Image */}
            <div className="relative h-48 w-full bg-[#040e22] overflow-hidden">
              <img
                src={
                  book.coverUrl ||
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
                }
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061432] via-transparent to-transparent" />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    book.isFree
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30'
                  }`}
                >
                  {book.isFree ? 'Free Read' : 'Premium'}
                </span>
              </div>
            </div>

            {/* Book Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white group-hover:text-[#e0a028] transition-colors line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  By {book.author || 'Academic Panel'}
                </p>
                {book.description && (
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  {book.pageCount} Pages • {book.fileSize}
                </span>

                <div className="flex items-center gap-1">
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="View PDF"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(book.id)}
                    disabled={deletingId === book.id}
                    title="Delete E-Book"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                  >
                    {deletingId === book.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add E-Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Publish New E-Book
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add digital handbooks, previous year question compilations or notes.
            </p>

            <form onSubmit={handleCreateEbook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEET 2026 Biology Rapid Revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Author / Editorial Panel
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ananya Sen"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description / Topics Covered
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of chapters and highlights..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Page Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    File Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  PDF Document URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.d3vx.in/ebooks/book.pdf"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#040e22] text-[#e0a028] focus:ring-[#e0a028]"
                />
                <label htmlFor="isFree" className="text-xs font-medium text-slate-300">
                  Make this E-Book freely accessible to all registered students
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                    <span>Publish E-Book</span>
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
