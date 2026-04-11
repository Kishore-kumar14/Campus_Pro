"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/i;
    const isTestEmail = formData.email.endsWith('@test.com');
    if (!emailRegex.test(formData.email) && !isTestEmail) {
      setError("Institutional email requirement: You must use a valid .edu or .ac.in address or @test.com.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          skills: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.user?.isVerified && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("fullName", formData.fullName);
        
        setTimeout(() => {
          try {
            if (router) {
              router.push("/dashboard");
            } else {
              window.location.href = "/dashboard";
            }
          } catch (err) {
            window.location.href = "/dashboard";
          }
        }, 500);
        
        return;
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 relative overflow-hidden bg-[#050505]">
        <div className="glass-ultra max-w-md w-full rounded-[3.5rem] p-16 text-center shadow-2xl relative z-10">
          <div className="w-24 h-24 bg-cyan-400/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-10 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-6">Verification Link Sent</h2>
          <p className="text-white/40 mb-12 leading-relaxed font-bold uppercase tracking-widest text-[10px]">
            Check your institutional inbox <span className="text-cyan-400 underline">{formData.email}</span> to synchronize your access.
          </p>
          <Link href="/login" className="inline-block w-full py-6 bg-cyan-400 text-[#050505] rounded-[2rem] font-black text-lg shadow-[0_20px_40px_-5px_rgba(34,211,238,0.4)] hover:bg-cyan-300 transition-all">
            Return to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 relative overflow-hidden bg-[#050505]">
      
      {/* RIVIERA VAULT MESH: ANIMATING & SHIFTING BLOBS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className={`absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] animate-blob-cw transition-transform duration-1000 ${isFocused ? 'translate-x-20 -translate-y-10 scale-110' : ''}`}></div>
         <div className={`absolute bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[160px] animate-blob-ccw transition-transform duration-1000 ${isFocused ? '-translate-x-20 translate-y-10 scale-110' : ''}`}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-12">
        <h2 className="text-6xl font-black tracking-tighter mb-4 gradient-text-rive">
          Join the Hub.
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-ultra py-14 px-10 rounded-[4rem] shadow-2xl overflow-hidden">

          <form className="space-y-10" onSubmit={handleSubmit}>
            <div className="relative group">
              <label className="block text-[9px] font-black text-neon-purple mb-2 uppercase tracking-[0.2em] ml-1" htmlFor="fullName">
                Full Identity
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full py-3 px-4 text-lg font-bold text-white bg-white/5 backdrop-blur-md border-b-2 border-white/20 focus:border-neon-cyan focus:shadow-[0_4px_12px_-4px_rgba(0,242,255,0.4)] outline-none transition-all placeholder:text-white/5 rounded-t-xl"
                placeholder="John Doe"
              />
            </div>

            <div className="relative group">
              <label className="block text-[9px] font-black text-neon-purple mb-2 uppercase tracking-[0.2em] ml-1" htmlFor="email">
                Institutional Access
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full py-3 px-4 text-lg font-bold text-white bg-white/5 backdrop-blur-md border-b-2 border-white/20 focus:border-neon-cyan focus:shadow-[0_4px_12px_-4px_rgba(0,242,255,0.4)] outline-none transition-all placeholder:text-white/5 rounded-t-xl"
                placeholder="student@vit.ac.in"
              />
            </div>

            <div className="relative group">
              <label className="block text-[9px] font-black text-neon-purple mb-2 uppercase tracking-[0.2em] ml-1" htmlFor="password">
                Secure Key
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full py-3 px-4 text-lg font-bold text-white bg-white/5 backdrop-blur-md border-b-2 border-white/20 focus:border-neon-cyan focus:shadow-[0_4px_12px_-4px_rgba(0,242,255,0.4)] outline-none transition-all placeholder:text-white/5 rounded-t-xl"
                placeholder="••••••••"
              />
            </div>

            <div className="relative">
               <label className="block text-[9px] font-black text-neon-purple mb-2 uppercase tracking-[0.2em] ml-1" htmlFor="role">
                Select Your Path
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full py-3 px-4 text-lg font-bold text-white bg-white/5 backdrop-blur-md border-b-2 border-white/20 focus:border-neon-cyan focus:shadow-[0_4px_12px_-4px_rgba(0,242,255,0.4)] outline-none transition-all appearance-none cursor-pointer rounded-t-xl"
              >
                <option value="Student" className="bg-[#050505] text-white">Student (Freelancer)</option>
                <option value="Client" className="bg-[#050505] text-white">Client (Recruiter)</option>
              </select>
            </div>

            {error && (
              <div className="p-6 rounded-[1.5rem] bg-red-400/10 border border-red-400/20 text-red-300 text-[11px] font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-7 bg-cyan-400 text-[#050505] font-black text-xl rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:bg-cyan-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest border-none"
            >
              {isLoading ? "Provisioning Vault..." : "Create Account"}
            </button>
          </form>
          
          <div className="mt-12 text-center">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
               Registered Explorer?{" "}
               <Link href="/login" className="text-cyan-400 hover:underline underline-offset-8 transition-all">
                  Synchronize Access
               </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
