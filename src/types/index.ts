import { Role } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    vehicleId: string | null;
    plateNumber: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      role: Role;
      vehicleId: string | null;
      plateNumber: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    vehicleId: string | null;
    plateNumber: string | null;
  }
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
