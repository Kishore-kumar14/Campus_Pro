"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Please verify your email via the link sent to your inbox.");
        }
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      if (data.fullName) {
        localStorage.setItem("fullName", data.fullName);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <h2 className="text-6xl font-black text-white tracking-tighter mb-2">
          Campus<span className="text-cyan-400">Pro</span>
        </h2>

      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="auth-card py-12 px-10 shadow-2xl rounded-[3rem]">
          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="relative group">
              <label className="block text-[10px] font-black text-white/50 mb-1 uppercase tracking-widest ml-1" htmlFor="email">
                Institutional Access
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full py-4 text-lg font-bold text-white neon-input placeholder:text-white/10"
                placeholder="you@vit.ac.in"
              />
            </div>

            <div className="relative group">
              <label className="block text-[10px] font-black text-white/50 mb-1 uppercase tracking-widest ml-1" htmlFor="password">
                Secure Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full py-4 text-lg font-bold text-white neon-input placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-6 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-cyan-400 text-blue-950 font-black text-xl rounded-2xl shadow-[0_20px_40px_-10px_rgba(34,211,238,0.3)] hover:bg-cyan-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center neon-glow"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-white/30 text-sm font-medium">
               New explorer?{" "}
               <Link href="/register" className="text-cyan-400 font-black hover:underline underline-offset-8 decoration-2">
                  Join the Hub
               </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
