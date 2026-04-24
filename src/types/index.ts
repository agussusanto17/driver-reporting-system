import { Role } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    username: string;
    phone: string | null;
    email: string | null;
    vehicleId: string | null;
    plateNumber: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      role: Role;
      username: string;
      phone: string | null;
      email: string | null;
      vehicleId: string | null;
      plateNumber: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    username: string;
    phone: string | null;
    email: string | null;
    vehicleId: string | null;
    plateNumber: string | null;
  }
}

// Vehicle
export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
}

// API response shapes
export interface ReportPhoto {
  id: string;
  filePath: string;
}

export interface ReportSummary {
  id: string;
  reportType: "PICKUP" | "DROP";
  originCity: string;
  destinationCity: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string };
  vehicle: { plateNumber: string };
  photos: ReportPhoto[];
}

export interface ReportsResponse {
  reports: ReportSummary[];
  total: number;
  page: number;
  limit: number;
}

// Report form data
export interface ReportFormData {
  reportType: "PICKUP" | "DROP";
  originCity: string;
  destinationCity: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  accuracy: number;
  notes?: string;
  photos: File[];
}

// Geolocation state
export interface GeoState {
  status: "idle" | "loading" | "success" | "error" | "denied";
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  locationName: string | null;
  error: string | null;
}
