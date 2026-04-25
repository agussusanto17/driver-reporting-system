"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User, Truck, LogOut, Loader2,
  IdCard, ShieldCheck, Hash, Phone, Mail,
  Pencil, X, Check, Lock, Eye, EyeOff,
  AlertTriangle, CheckCircle,
} from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ── Input field ────────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  );
}

// ── Password field with show/hide ──────────────────────────────────────────────
function PasswordField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 px-3 pr-10 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

// ── Info row (read-only) ───────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <div className="text-gray-400 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 text-sm font-medium text-white w-max max-w-xs ${
      type === "success" ? "bg-success" : "bg-danger"
    }`}>
      {type === "success"
        ? <CheckCircle size={15} strokeWidth={1.5} />
        : <AlertTriangle size={15} strokeWidth={1.5} />
      }
      {message}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session, status, update } = useSession();

  // Vehicle type
  const [vehicleType, setVehicleType] = useState<string | null>(null);

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // Change password state
  const [pwMode, setPwMode]           = useState(false);
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [savingPw, setSavingPw]       = useState(false);

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.vehicleId) return;
    fetch("/api/vehicles")
      .then((r) => r.ok ? r.json() : [])
      .then((vehicles: { id: string; plateNumber: string; type: string }[]) => {
        const v = vehicles.find((v) => v.id === session.user.vehicleId);
        if (v) setVehicleType(v.type);
      })
      .catch(() => {});
  }, [status, session?.user?.vehicleId]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setPhone(session.user.phone ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) redirect("/login");

  // Save profile
  const handleSaveProfile = async () => {
    if (!name.trim()) return showToast("Nama tidak boleh kosong", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await update({ name: data.name, phone: data.phone, email: data.email });
      setEditMode(false);
      showToast("Profil berhasil diperbarui", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save password
  const handleSavePassword = async () => {
    if (!currentPw || !newPw || !confirmPw)
      return showToast("Semua field wajib diisi", "error");
    if (newPw !== confirmPw)
      return showToast("Konfirmasi password tidak cocok", "error");
    if (newPw.length < 6)
      return showToast("Password baru minimal 6 karakter", "error");

    setSavingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwMode(false);
      showToast("Password berhasil diubah", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Gagal mengubah password", "error");
    } finally {
      setSavingPw(false);
    }
  };

  const cancelEdit = () => {
    setName(session.user.name ?? "");
    setPhone(session.user.phone ?? "");
    setEmail(session.user.email ?? "");
    setEditMode(false);
  };

  const cancelPw = () => {
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwMode(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* ── Header ── */}
      <header className="bg-primary px-4 pb-8" style={{ paddingTop: "max(2.5rem, env(safe-area-inset-top, 2.5rem))" }}>
        <div className="flex flex-col items-center text-center">
          <div className="avatar-circle w-20 h-20 bg-accent flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl tracking-wide">
              {getInitials(session.user.name ?? "?")}
            </span>
          </div>
          <h1 className="text-white font-bold text-xl leading-tight">{session.user.name}</h1>
          <p className="text-white/50 text-xs mt-1">Driver</p>
        </div>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">

        {/* ── Info Profil ── */}
        <div className="bg-white border border-gray-200">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Informasi Profil
            </p>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-accent"
              >
                <Pencil size={13} strokeWidth={1.5} />
                Ubah
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={cancelEdit} className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <X size={13} strokeWidth={1.5} /> Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-accent px-3 py-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={12} strokeWidth={1.5} className="animate-spin" /> : <Check size={13} strokeWidth={2} />}
                  Simpan
                </button>
              </div>
            )}
          </div>

          {!editMode ? (
            <div className="px-4">
              <InfoRow icon={<User size={16} strokeWidth={1.5} />}   label="Nama Lengkap" value={session.user.name ?? "—"} />
              <InfoRow icon={<IdCard size={16} strokeWidth={1.5} />} label="Username"     value={session.user.username ?? "—"} />
              <InfoRow icon={<Phone size={16} strokeWidth={1.5} />}  label="No. Telepon"  value={session.user.phone ?? "—"} />
              <InfoRow icon={<Mail size={16} strokeWidth={1.5} />}   label="Email"        value={session.user.email ?? "—"} />
              <InfoRow icon={<ShieldCheck size={16} strokeWidth={1.5} />} label="Peran"  value="Driver" />
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              <Field label="Nama Lengkap" value={name}  onChange={setName}  placeholder="Nama lengkap" />
              <Field label="No. Telepon"  value={phone} onChange={setPhone} placeholder="Contoh: 08123456789" type="tel" />
              <Field label="Email"        value={email} onChange={setEmail} placeholder="Contoh: nama@email.com" type="email" />
              <p className="text-xs text-gray-400">Username tidak dapat diubah.</p>
            </div>
          )}
        </div>

        {/* ── Kendaraan ── */}
        <div className="bg-white border border-gray-200">
          <p className="px-4 pt-4 pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            Kendaraan
          </p>
          <div className="px-4">
            <InfoRow icon={<Hash size={16} strokeWidth={1.5} />}  label="Nomor Polisi"    value={session.user.plateNumber ?? "Belum ada kendaraan"} />
            <InfoRow icon={<Truck size={16} strokeWidth={1.5} />} label="Tipe Kendaraan"  value={vehicleType ?? "—"} />
          </div>
        </div>

        {/* ── Ubah Password ── */}
        <div className="bg-white border border-gray-200">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Keamanan
            </p>
            {!pwMode ? (
              <button
                onClick={() => setPwMode(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-accent"
              >
                <Lock size={13} strokeWidth={1.5} />
                Ubah Password
              </button>
            ) : (
              <button onClick={cancelPw} className="text-xs text-gray-400 font-medium flex items-center gap-1">
                <X size={13} strokeWidth={1.5} /> Batal
              </button>
            )}
          </div>

          {!pwMode ? (
            <div className="px-4 py-3.5">
              <p className="text-sm text-gray-400">Password terakhir diubah saat akun dibuat.</p>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              <PasswordField label="Password Saat Ini"   value={currentPw} onChange={setCurrentPw} placeholder="Masukkan password saat ini" />
              <PasswordField label="Password Baru"       value={newPw}     onChange={setNewPw}     placeholder="Minimal 6 karakter" />
              <PasswordField label="Konfirmasi Password" value={confirmPw} onChange={setConfirmPw} placeholder="Ulangi password baru" />
              <button
                onClick={handleSavePassword}
                disabled={savingPw}
                className="w-full h-11 bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary-600 transition-colors"
              >
                {savingPw
                  ? <><Loader2 size={15} strokeWidth={1.5} className="animate-spin" /> Menyimpan...</>
                  : <><Check size={15} strokeWidth={2} /> Simpan Password</>
                }
              </button>
            </div>
          )}
        </div>

        {/* ── Logout ── */}
        <button
          onClick={async () => { setLoggingOut(true); await signOut({ callbackUrl: "/login" }); }}
          disabled={loggingOut}
          className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-danger text-danger font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {loggingOut
            ? <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
            : <LogOut size={16} strokeWidth={1.5} />
          }
          {loggingOut ? "Keluar..." : "Keluar dari Akun"}
        </button>

        <p className="text-center text-xs text-gray-300 pb-2">Driver Reporting System · v1.0</p>
      </div>
    </div>
  );
}
