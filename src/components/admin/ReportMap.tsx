"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ReportSummary } from "@/types";

// Fix Leaflet default icon path di Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom DivIcon per tipe laporan
function makeIcon(type: "PICKUP" | "DROP") {
  const color = type === "PICKUP" ? "#2563EB" : "#16A34A";
  const label = type === "PICKUP" ? "P" : "D";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;background:${color};
      border:2px solid white;display:flex;align-items:center;
      justify-content:center;color:white;font-weight:700;
      font-size:11px;font-family:Manrope,sans-serif;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// Komponen untuk auto-fit bounds ke semua marker
function FitBounds({ reports }: { reports: ReportSummary[] }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length === 0) return;
    const bounds = L.latLngBounds(reports.map((r) => [r.latitude, r.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [reports, map]);
  return null;
}

interface ReportMapProps {
  reports: ReportSummary[];
}

export default function ReportMap({ reports }: ReportMapProps) {
  const center: [number, number] = reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [-6.2, 106.816]; // Jakarta default

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds reports={reports} />
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.latitude, r.longitude]}
          icon={makeIcon(r.reportType)}
        >
          <Popup>
            <div style={{ fontFamily: "Manrope, sans-serif", minWidth: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  background: r.reportType === "PICKUP" ? "#EFF6FF" : "#F0FDF4",
                  color: r.reportType === "PICKUP" ? "#2563EB" : "#16A34A",
                  padding: "2px 6px",
                }}>
                  {r.reportType}
                </span>
                <span style={{ fontSize: 11, color: "#6B7280" }}>{formatTime(r.createdAt)}</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px 0", color: "#111827" }}>
                {r.originCity} → {r.destinationCity}
              </p>
              <p style={{ fontSize: 11, color: "#6B7280", margin: "0 0 2px 0" }}>
                👤 {r.user.name}
              </p>
              <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
                🚛 {r.vehicle.plateNumber}
              </p>
              {r.locationName && (
                <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>
                  📍 {r.locationName}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
