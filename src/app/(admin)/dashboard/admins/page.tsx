"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, X, Check, Loader2,
  ShieldCheck, Search, Eye, EyeOff,
  AlertTriangle, CheckCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminRow {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white ${type === "success" ? "bg-success" : "bg-danger"}`}>
      {type === "success" ? <CheckCircle size={15} strokeWidth={1.5} /> : <AlertTriangle size={15} strokeWidth={1.5} />}
      {message}
    </div>
  );
}

// ── Password input ─────────────────────────────────────────────────────────────
function PwInput({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-danger ml-1">*</span>}
      </label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          className="w-full h-10 px-3 pr-9 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors" />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {show ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

// ── Admin modal ────────────────────────────────────────────────────────────────
function AdminModal({ admin, onClose, onSave }: {
  admin?: AdminRow;
  onClose: () => void;
  onSave: (data: Record<string, string>) => Promise<void>;
}) {
  const isEdit = !!admin;
  const [name, setName]         = useState(admin?.name ?? "");
  const [username, setUsername] = useState(admin?.username ?? "");
  const [password, setPassword] = useState("");
  const [phone, setPhone]       = useState(admin?.phone ?? "");
  const [email, setEmail]       = useState(admin?.email ?? "");
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ name, username, password, phone, email });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit Admin" : "Tambah Admin"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nama Lengkap <span className="text-danger">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Nama admin" className="w-full h-10 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Username <span className="text-danger">*</span></label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
              placeholder="Username untuk login" className="w-full h-10 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors" />
          </div>

          <PwInput
            label={isEdit ? "Password Baru" : "Password"}
            value={password} onChange={setPassword}
            placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
            required={!isEdit}
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">No. Telepon</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx" className="w-full h-10 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@domain.com" className="w-full h-10 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Check size={14} strokeWidth={2} />}
              {isEdit ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm delete ─────────────────────────────────────────────────────────────
function ConfirmDelete({ admin, onConfirm, onCancel, loading }: {
  admin: AdminRow; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} strokeWidth={1.5} className="text-danger" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Hapus Admin?</h3>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">{admin.name}</span> ({admin.username}) akan dihapus permanen.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 h-10 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 h-10 bg-danger text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Trash2 size={14} strokeWidth={1.5} />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminsPage() {
  const { data: session, status } = useSession();

  const [admins, setAdmins]         = useState<AdminRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<AdminRow | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<AdminRow | undefined>();
  const [deleting, setDeleting]     = useState(false);
  const [toast, setToast]           = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function safeJson(res: Response) {
    try { return await res.json(); } catch { return {}; }
  }

  async function fetchAdmins() {
    const res = await fetch("/api/admin/admins");
    if (res.ok) setAdmins(await res.json());
    setLoading(false);
  }

  useEffect(() => { if (status === "authenticated") fetchAdmins(); }, [status]);

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-screen"><Loader2 size={24} className="animate-spin text-accent" /></div>
  );
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const handleAdd = async (data: Record<string, string>) => {
    const res = await fetch("/api/admin/admins", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const json = await safeJson(res);
    if (!res.ok) { showToast(json.error ?? "Gagal menambahkan admin", "error"); return; }
    setAdmins(prev => [...prev, json].sort((a, b) => a.name.localeCompare(b.name)));
    setShowModal(false);
    showToast("Admin berhasil ditambahkan", "success");
  };

  const handleEdit = async (data: Record<string, string>) => {
    if (!editTarget) return;
    const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== ""));
    const res = await fetch(`/api/admin/admins/${editTarget.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await safeJson(res);
    if (!res.ok) { showToast(json.error ?? "Gagal memperbarui admin", "error"); return; }
    setAdmins(prev => prev.map(a => a.id === json.id ? json : a));
    setEditTarget(undefined);
    showToast("Admin berhasil diperbarui", "success");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/admins/${deleteTarget.id}`, { method: "DELETE" });
    const json = await safeJson(res);
    if (!res.ok) { showToast(json.error ?? "Gagal menghapus admin", "error"); setDeleting(false); return; }
    setAdmins(prev => prev.filter(a => a.id !== deleteTarget.id));
    setDeleteTarget(undefined);
    setDeleting(false);
    showToast("Admin berhasil dihapus", "success");
  };

  const filtered = search.trim()
    ? admins.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.username.toLowerCase().includes(search.toLowerCase()) ||
        (a.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.phone ?? "").includes(search)
      )
    : admins;

  return (
    <div className="p-4 lg:p-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {(showModal || editTarget) && (
        <AdminModal
          admin={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(undefined); }}
          onSave={editTarget ? handleEdit : handleAdd}
        />
      )}

      {deleteTarget && (
        <ConfirmDelete
          admin={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(undefined)}
          loading={deleting}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Master Admin</h1>
          <p className="text-sm text-gray-400 mt-0.5">{admins.length} admin terdaftar</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors">
          <Plus size={15} strokeWidth={2} />

        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-10 mb-4">
        <Search size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama, username, email, atau telepon..."
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent" />
        {search && <button onClick={() => setSearch("")}><X size={14} strokeWidth={1.5} className="text-gray-400" /></button>}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        <div className="grid grid-cols-[40px_1fr_140px_140px_160px_100px] border-b border-gray-200 bg-gray-50">
          {["No", "Nama", "Username", "No. Telpon", "Email", "Aksi"].map((h, i) => (
            <div key={i} className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? "text-center" : ""}`}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <ShieldCheck size={32} strokeWidth={1.5} />
            <p className="text-sm">{search ? "Tidak ada admin ditemukan" : "Belum ada admin"}</p>
          </div>
        ) : (
          filtered.map((a, idx) => (
            <div key={a.id} className="grid grid-cols-[40px_1fr_140px_140px_160px_100px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="px-3 py-3.5 text-sm text-gray-400 text-center">{idx + 1}</div>

              <div className="px-3 py-3.5 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{a.name}</p>
                {a.id === session.user.id && (
                  <span className="text-[10px] font-bold text-accent">Akun saya</span>
                )}
              </div>

              <div className="px-3 py-3.5">
                <span className="text-sm font-mono text-gray-700">{a.username}</span>
              </div>

              <div className="px-3 py-3.5">
                <span className="text-sm text-gray-700">{a.phone ?? <span className="text-gray-300">—</span>}</span>
              </div>

              <div className="px-3 py-3.5 min-w-0">
                <span className="text-sm text-gray-700 truncate block">{a.email ?? <span className="text-gray-300">—</span>}</span>
              </div>

              <div className="px-3 py-3.5 flex items-center gap-1.5">
                <button onClick={() => setEditTarget(a)}
                  className="flex items-center gap-1 h-7 px-2.5 bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <Pencil size={12} strokeWidth={1.5} /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(a)}
                  disabled={a.id === session.user.id}
                  className="h-7 px-2 flex items-center text-gray-300 hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={a.id === session.user.id ? "Tidak bisa hapus akun sendiri" : "Hapus"}
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
