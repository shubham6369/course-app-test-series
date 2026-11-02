'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  User,
  Shield,
  GraduationCap,
  Key,
  X,
  Loader2,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';

interface StaffItem {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string | Date;
}

interface StaffClientProps {
  initialStaff: StaffItem[];
}

export function StaffClient({ initialStaff }: StaffClientProps) {
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456!!');
  const [role, setRole] = useState('teacher');

  const ownerCount = staffList.filter((s) => s.role === 'owner').length;
  const adminCount = staffList.filter((s) => s.role === 'admin').length;
  const teacherCount = staffList.filter((s) => s.role === 'teacher').length;

  const handleRoleChange = async (id: number, newRole: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStaffList(
          staffList.map((s) => (s.id === id ? { ...s, role: newRole } : s))
        );
      }
    } catch (err) {
      console.error('Error changing staff role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStaffList([...staffList, data.data]);
        setIsModalOpen(false);
        setName('');
        setEmail('');
      } else {
        alert(data.message || 'Failed to create staff member');
      }
    } catch (err) {
      console.error('Error creating staff:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, staffRole: string) => {
    if (staffRole === 'owner') {
      alert('The system owner account cannot be deleted.');
      return;
    }
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStaffList(staffList.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Team & Staff RBAC Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage administrative access levels, faculty accounts, and moderation roles.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-sm hover:brightness-110 shadow-lg shadow-[#e0a028]/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Staff"
          value={staffList.length}
          subtitle="Registered operators"
          icon={ShieldCheck}
          colorScheme="gold"
        />
        <KpiCard
          title="System Owners"
          value={ownerCount}
          subtitle="Full root privileges"
          icon={Key}
          colorScheme="purple"
        />
        <KpiCard
          title="Platform Admins"
          value={adminCount}
          subtitle="Operations & commerce"
          icon={Shield}
          colorScheme="blue"
        />
        <KpiCard
          title="Faculty Instructors"
          value={teacherCount}
          subtitle="Doubts & CBT authoring"
          icon={GraduationCap}
          colorScheme="emerald"
        />
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-white/10 bg-[#061432]/60 backdrop-blur-md overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-white">
            Authorized Personnel Directory
          </h3>
          <span className="text-xs text-slate-400">
            {staffList.length} accounts configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09214b]/40 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Staff Member</th>
                <th className="py-3.5 px-4 font-semibold">Email Account</th>
                <th className="py-3.5 px-4 font-semibold">RBAC Role</th>
                <th className="py-3.5 px-4 font-semibold">Joined Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#09214b] to-[#e0a028] flex items-center justify-center font-bold text-white text-xs border border-[#e0a028]/30 overflow-hidden shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-[#e0a028] transition-colors">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: #{member.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {member.email}
                  </td>

                  {/* Role Selector */}
                  <td className="py-3.5 px-4">
                    {member.role === 'owner' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#e0a028]/20 text-[#e0a028] border border-[#e0a028]/30">
                        OWNER (ROOT)
                      </span>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={updatingId === member.id}
                        className="px-2.5 py-1 rounded-lg bg-[#040e22] border border-white/10 text-xs text-white focus:outline-none focus:border-[#e0a028]"
                      >
                        <option value="admin">Admin</option>
                        <option value="teacher">Faculty Teacher</option>
                        <option value="staff">Operations Staff</option>
                      </select>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(member.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleDelete(member.id, member.role)}
                        title="Remove Staff"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#061432] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Add New Staff Account
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Create an administrative or faculty profile with role-based access control.
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@edutech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#e0a028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assign Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  >
                    <option value="teacher">Faculty Teacher</option>
                    <option value="admin">Platform Admin</option>
                    <option value="staff">Operations Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#040e22] border border-white/10 text-sm text-white focus:outline-none focus:border-[#e0a028]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#e0a028] to-[#d49018] text-[#061432] font-semibold text-xs hover:brightness-110 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Staff Account</span>
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
