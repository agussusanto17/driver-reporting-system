"use client";

export const dynamic = "force-dynamic";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Username atau password salah");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Image
            src="/images/truckinc-logo-white.svg"
            alt="Truckinc"
            width={140}
            height={38}
            className="h-9 w-auto"
            priority
          />
          <p className="text-white/50 text-sm">Driver Reporting System</p>
        </div>

        <div className="bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Masuk ke Akun</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-danger text-sm p-3 border border-red-100">
                <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-11 px-3 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 pr-10 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword
                    ? <EyeOff size={16} strokeWidth={1.5} />
                    : <Eye size={16} strokeWidth={1.5} />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-accent text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
