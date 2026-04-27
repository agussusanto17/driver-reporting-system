"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Plus, Pencil, X, Check, Loader2,
  Truck, Search, ToggleLeft, ToggleRight,
  AlertTriangle, CheckCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface VehicleRow {
  id: string;
  plateNumber: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  users: { id: string; name: string }[];
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

// ── Add / Edit Modal ───────────────────────────────────────────────────────────
function VehicleModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle?: VehicleRow;
  onClose: () => void;
  onSave: (data: { plateNumber: string; type: string }) => Promise<void>;
}) {
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber ?? "");
  const [type, setType]               = useState(vehicle?.type ?? "");
  const [saving, setSaving]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ plateNumber, type });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">
            {vehicle ? "Edit Kendaraan" : "Tambah Kendaraan"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Nomor Polisi <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={plateNumber}
              onChange={e => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="Contoh: B1234XYZ"
              className="w-full h-10 px-3 border border-gray-200 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Tipe Kendaraan <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="Contoh: Truck Box, Pickup, Tronton"
              className="w-full h-10 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} strokeWidth={1.5} className="animate-spin" /> : <Check size={14} strokeWidth={2} />}
              {vehicle ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function VehiclesPage() {
  const { data: session, status } = useSession();

  const [vehicles, setVehicles]     = useState<VehicleRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState<VehicleRow | undefined>();
  const [toast, setToast]           = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchVehicles() {
    const res = await fetch("/api/vehicles?all=true");
    if (res.ok) setVehicles(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") fetchVehicles();
  }, [status]);

  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  // Handlers
  const handleAdd = async (data: { plateNumber: string; type: string }) => {
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.error, "error"); return; }
    setVehicles(prev => [...prev, json].sort((a, b) => a.plateNumber.localeCompare(b.plateNumber)));
    setShowModal(false);
    showToast("Kendaraan berhasil ditambahkan", "success");
  };

  const handleEdit = async (data: { plateNumber: string; type: string }) => {
    if (!editTarget) return;
    const res = await fetch(`/api/vehicles/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.error, "error"); return; }
    setVehicles(prev => prev.map(v => v.id === json.id ? json : v));
    setEditTarget(undefined);
    showToast("Kendaraan berhasil diperbarui", "success");
  };

  const handleToggle = async (vehicle: VehicleRow) => {
    const res = await fetch(`/api/vehicles/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !vehicle.isActive }),
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.error, "error"); return; }
    setVehicles(prev => prev.map(v => v.id === json.id ? json : v));
    showToast(json.isActive ? "Kendaraan diaktifkan" : "Kendaraan dinonaktifkan", "success");
  };

  const filtered = search.trim()
    ? vehicles.filter(v =>
        v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.type.toLowerCase().includes(search.toLowerCase()) ||
        v.users.some(u => u.name.toLowerCase().includes(search.toLowerCase()))
      )
    : vehicles;

  const active   = vehicles.filter(v => v.isActive).length;
  const inactive = vehicles.filter(v => !v.isActive).length;

  return (
    <div className="p-4 lg:p-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {(showModal || editTarget) && (
        <VehicleModal
          vehicle={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(undefined); }}
          onSave={editTarget ? handleEdit : handleAdd}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Master Kendaraan</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {vehicles.length} kendaraan · {active} aktif · {inactive} nonaktif
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-9 px-4 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
        >
          <Plus size={15} strokeWidth={2} />

        </button>
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 h-10 mb-4">
        <Search size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nopol, tipe, atau nama driver..."
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
        />
        {search && <button onClick={() => setSearch("")}><X size={14} strokeWidth={1.5} className="text-gray-400" /></button>}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-200 overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-[50px_160px_1fr_1fr_100px_120px] border-b border-gray-200 bg-gray-50">
          {["No", "Nopol", "Tipe", "Driver", "Status", "Aksi"].map((h, i) => (
            <div key={i} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? "text-center" : ""}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} strokeWidth={1.5} className="animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Truck size={32} strokeWidth={1.5} />
            <p className="text-sm">{search ? "Tidak ada kendaraan ditemukan" : "Belum ada kendaraan"}</p>
          </div>
        ) : (
          filtered.map((v, idx) => (
            <div key={v.id} className="grid grid-cols-[50px_160px_1fr_1fr_100px_120px] border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="px-4 py-3.5 text-sm text-gray-400 text-center">{idx + 1}</div>
              <div className="px-4 py-3.5">
                <span className="text-sm font-bold font-mono text-gray-900">{v.plateNumber}</span>
              </div>
              <div className="px-4 py-3.5">
                <span className="text-sm text-gray-700">{v.type}</span>
              </div>
              <div className="px-4 py-3.5 min-w-0">
                {v.users.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {v.users.map(u => (
                      <span key={u.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 font-medium">
                        {u.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Belum ada driver</span>
                )}
              </div>
              <div className="px-4 py-3.5">
                <span className={`text-xs font-semibold px-2 py-1 ${v.isActive ? "bg-green-50 text-success" : "bg-gray-100 text-gray-400"}`}>
                  {v.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <div className="px-4 py-3.5 flex items-center gap-2">
                <button
                  onClick={() => setEditTarget(v)}
                  className="flex items-center gap-1.5 h-7 px-2.5 bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Pencil size={12} strokeWidth={1.5} /> Edit
                </button>
                <button
                  onClick={() => handleToggle(v)}
                  title={v.isActive ? "Nonaktifkan" : "Aktifkan"}
                  className={`h-7 px-2 flex items-center transition-colors ${v.isActive ? "text-gray-400 hover:text-danger" : "text-gray-400 hover:text-success"}`}
                >
                  {v.isActive
                    ? <ToggleRight size={18} strokeWidth={1.5} className="text-success" />
                    : <ToggleLeft size={18} strokeWidth={1.5} className="text-gray-300" />
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
