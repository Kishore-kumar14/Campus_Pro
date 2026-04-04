"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("unauthorized");

      const response = await fetch("http://localhost:5000/api/user/profile/portfolio", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data.user);
      setIsExamMode(data.user.examMode);
    } catch (err: any) {
      setError(err.message === "unauthorized" ? "Please log in to view dashboard." : "Error loading profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleExamToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const nextMode = !isExamMode;
      
      const response = await fetch("http://localhost:5000/api/user/update-exam-mode", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ examMode: nextMode }),
      });

      if (response.ok) {
        setIsExamMode(nextMode);
        if (nextMode) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
        }
      }
    } catch (err) {
      console.error("Error toggling exam mode");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-[0.3em]">Initializing Hub...</div>;

  return (
    <div className="min-h-screen relative overflow-hidden font-sans bg-[#050505]">
      
      {/* BACKGROUND MESH: ANIMATING BLOBS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-blob-cw"></div>
         <div className="absolute bottom-1/4 -right-1/4 w-[700px] h-[700px] bg-cyan-500/20 rounded-full blur-[140px] animate-blob-ccw"></div>
      </div>

      {/* RIVIERA SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="bg-white/5 backdrop-blur-3xl border border-cyan-400/30 p-6 rounded-[2rem] shadow-[0_0_40px_rgba(34,211,238,0.3)] flex items-center space-x-6">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center text-cyan-400 ring-2 ring-cyan-400/20">
                 <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                 <p className="font-black text-white text-sm uppercase tracking-widest">Focus Mode Synchronized</p>
                 <p className="text-cyan-400/80 text-[10px] font-black uppercase tracking-widest">Profile is now stealth-active</p>
              </div>
           </div>
        </div>
      )}

      {/* DASHBOARD CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 min-h-screen flex flex-col">
        
        {/* HEADER: IDENTITY HUB */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-center space-x-10">
            <div className="w-32 h-32 rounded-[2.5rem] glass-ultra flex items-center justify-center text-6xl font-black text-cyan-400 shadow-2xl relative group">
              <div className="absolute inset-0 bg-cyan-400/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              {profile?.fullName?.[0] || "S"}
            </div>
            <div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                <h1 className="text-6xl font-black text-white tracking-tighter">{profile?.fullName}</h1>
                <div className="inline-flex items-center px-4 py-1.5 neon-gradient-pill text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse-neon">
                   Verified Student Elite
                </div>
              </div>
              <p className="text-white/30 font-black uppercase tracking-[0.3em] text-xs leading-relaxed max-w-xl">
                 Bridging the experience paradox within the CampusPro framework.
              </p>
            </div>
          </div>

          <div className="glass-ultra p-10 rounded-[3rem] flex items-center space-x-10">
            <div className="text-right">
              <div className={`text-xs font-black uppercase tracking-[0.2em] mb-2 transition-all ${isExamMode ? "neon-gold-text" : "text-white/20"}`}>
                 {isExamMode ? "Focus Mode: Active" : "Operational Mode"}
              </div>
              <div className="text-sm font-bold text-white/50">{isExamMode ? "Blocking Incoming Bids" : "Awaiting New Projects"}</div>
            </div>
            {/* RIVIERA NEON SWITCH */}
            <button 
              onClick={handleExamToggle}
              className={`w-20 h-10 rounded-full transition-all duration-700 relative border-2 ${isExamMode ? "bg-cyan-400/20 border-cyan-400 shadow-[0_0_20px_#00f2ff]" : "bg-white/5 border-white/10"}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${isExamMode ? "left-11 bg-cyan-400 shadow-[0_0_15px_#00f2ff]" : "left-1.5 bg-white/20"}`}></div>
            </button>
          </div>
        </div>

        {/* MAIN GRID: PERFORMANCE HUB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow">
          
          <div className="lg:col-span-8 space-y-10">
            {/* PERFORMANCE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-ultra p-12 rounded-[3.5rem] flex flex-col justify-center hover-glow-purple">
                 <div className="text-6xl font-black text-white mb-3 tracking-tighter">{profile?.completedJobs?.length || 0}</div>
                 <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em]">Projects Forge Complete</div>
              </div>

              <div className="glass-ultra p-12 rounded-[3.5rem] flex flex-col items-center justify-center relative group hover-glow-purple">
                <svg className="w-32 h-32 transform -rotate-90">
                  <defs>
                    <linearGradient id="ultraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#00f2ff" />
                    </linearGradient>
                  </defs>
                  <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="url(#ultraGradient)" strokeWidth="8" fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * (profile?.points || 0)) / 1000}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(0,242,255,0.4)]"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-white tracking-tighter">{profile?.points || 0}</span>
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em]">Swap Points</span>
                </div>
              </div>

              <div className="glass-ultra p-12 rounded-[3.5rem] flex flex-col justify-center relative group cursor-pointer hover-glow-cyan border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                 <div className="absolute top-6 right-8 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                 <div className="text-6xl font-black text-cyan-400 mb-3 tracking-tighter group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all">4</div>
                 <div className="text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.25em]">Active Bidding Stream</div>
              </div>
            </div>

            {/* SKILL STACKS HUB */}
            <div className="glass-ultra p-14 rounded-[4rem]">
               <h3 className="text-xl font-black text-white mb-12 uppercase tracking-[0.3em] flex items-center">
                  <span className="w-12 h-0.5 bg-cyan-400 mr-6"></span>
                  Verified Skill Artifacts
               </h3>
               <div className="flex flex-wrap gap-5">
                  {profile?.skills?.map((skill: string, i: number) => (
                    <div key={i} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-white/50 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:text-cyan-400 transition-all cursor-default uppercase tracking-widest">
                       {skill}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* ACTION HUB: MARKETPLACE BRIDGE */}
          <div className="lg:col-span-4">
             <div className="glass-ultra p-14 h-full flex flex-col justify-end relative overflow-hidden group rounded-[4rem] hover-glow-cyan">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10 mb-12">
                   <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8">Forge Your Impact.</h2>
                   <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] leading-loose">
                      Synchronize with the marketplace to access exclusive projects and escalate your profile match score.
                   </p>
                </div>
                <Link href="/jobs" className="w-full py-7 bg-cyan-400 text-[#050505] font-black text-2xl rounded-[2.5rem] text-center shadow-[0_25px_50px_-10px_rgba(34,211,238,0.5)] transition-all hover:bg-cyan-300 active:scale-95 neon-glow block">
                   Browse Catalyst
                </Link>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
