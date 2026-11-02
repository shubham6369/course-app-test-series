'use client';

import { useState } from 'react';
import {
  Users2,
  Pin,
  Trash2,
  Search,
  MessageCircle,
  Heart,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface CommentItem {
  id: number;
  authorName: string;
  authorAvatar: string | null;
  comment: string;
  createdAt: string | Date;
}

interface PostItem {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  replyCount: number;
  isPinned: boolean;
  createdAt: string | Date;
  comments: CommentItem[];
}

interface CommunityClientProps {
  initialPosts: PostItem[];
}

export function CommunityClient({ initialPosts }: CommunityClientProps) {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [search, setSearch] = useState('');
  const [activeCommentsPost, setActiveCommentsPost] = useState<PostItem | null>(null);
  const [pinningId, setPinningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedCount = posts.filter((p) => p.isPinned).length;
  const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
  const totalReplies = posts.reduce((sum, p) => sum + (p.comments?.length || p.replyCount), 0);

  const handleTogglePin = async (id: number, currentPinned: boolean) => {
    setPinningId(id);
    try {
      const res = await fetch('/api/admin/community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPinned: !currentPinned }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(
          posts.map((p) => (p.id === id ? { ...p, isPinned: !currentPinned } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    } finally {
      setPinningId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this community post?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/community?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        if (activeCommentsPost?.id === id) {
          setActiveCommentsPost(null);
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
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
            Community Moderation & Feed Desk
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review peer study discussions, remove inappropriate content, and pin vital notices.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Discussions"
          value={posts.length}
          subtitle="Aspirant study posts"
          icon={Users2}
          colorScheme="gold"
        />
        <KpiCard
          title="Pinned Highlights"
          value={pinnedCount}
          subtitle="Top of mobile feed"
          icon={Pin}
          colorScheme="purple"
        />
        <KpiCard
          title="Community Reactions"
          value={totalLikes}
          subtitle="Student upvotes & likes"
          icon={Heart}
          colorScheme="emerald"
        />
        <KpiCard
          title="Comment Replies"
          value={totalReplies}
          subtitle="Threaded discussions"
          icon={MessageCircle}
          colorScheme="blue"
        />
      </div>

      {/* Search Input */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search discussion text or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#040e22] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028] transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredPosts.length} posts
        </span>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-white/5 rounded-2xl bg-[#061432]/30">
            No community posts match your search query.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-all ${
                post.isPinned
                  ? 'border-[#e0a028]/40 bg-[#09214b]/40 shadow-lg shadow-[#09214b]/30'
                  : 'border-white/10 bg-[#061432]/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-sm border border-[#e0a028]/30 overflow-hidden shrink-0">
                    {post.authorAvatar ? (
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      post.authorName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {post.authorName}
                      </span>
                      {post.isPinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                          <Pin className="w-3 h-3" />
                          PINNED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(post.id, post.isPinned)}
                    disabled={pinningId === post.id}
                    title={post.isPinned ? 'Unpin post' : 'Pin post to top'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      post.isPinned
                        ? 'bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/40 hover:bg-[#e0a028]/30'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    <span>{post.isPinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    title="Remove post"
                    className="p-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors border border-rose-500/20 disabled:opacity-50"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="mt-3.5 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>

              {/* Image Preview */}
              {post.imageUrl && (
                <div className="mt-3.5 max-w-md rounded-xl overflow-hidden border border-white/10 bg-[#040e22]">
                  <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
              )}

              {/* Footer Metrics & Discussion Opener */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                    <span>{post.likeCount} Likes</span>
                  </span>
                  <button
                    onClick={() => setActiveCommentsPost(post)}
                    className="flex items-center gap-1.5 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || post.replyCount} Replies</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveCommentsPost(post)}
                  className="text-[#e0a028] hover:underline font-medium text-xs"
                >
                  View Discussion ({post.comments?.length || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comments Thread Drawer/Modal */}
      {activeCommentsPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setActiveCommentsPost(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Discussion Thread
            </h3>
            <p className="text-xs text-slate-400 mb-4 line-clamp-2">
              On post by {activeCommentsPost.authorName}: "{activeCommentsPost.content}"
            </p>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-white/5">
              {activeCommentsPost.comments?.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  No replies on this post yet.
                </p>
              ) : (
                activeCommentsPost.comments?.map((c) => (
                  <div key={c.id} className="pt-3 first:pt-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {c.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-end">
              <button
                onClick={() => setActiveCommentsPost(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
