"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RivieraLandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-100 overflow-x-hidden transition-all duration-700">
      {/* Navbar */}
      <nav className="fixed top-0 w-full px-8 py-6 flex justify-between items-center z-50 bg-transparent backdrop-blur-md border-b border-white/5">
        <div className="text-3xl font-black text-white tracking-tighter hover:scale-105 transition-transform cursor-pointer">
           Campus<span className="text-cyan-400">Pro</span>
        </div>
        <div className="hidden md:flex space-x-10 text-sm font-bold uppercase tracking-widest text-white/70">
           <Link href="/jobs" className="hover:text-cyan-400 transition-colors">Marketplace</Link>
           <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
           <Link href="/register" className="text-white hover:text-cyan-400 transition-colors">Join</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 px-6 overflow-hidden">
        {/* Background Mesh (Global CSS handles radial) */}
        <div className="absolute inset-0 opacity-[0.05] z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '64px 64px' }}></div>

        <div className={`max-w-6xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          
          <h1 className="text-7xl md:text-[8rem] font-black leading-[0.95] tracking-tighter mb-10 text-white">
             Bridge the <br /> 
             <span className="gradient-text-rive block mt-2">
               Experience Paradox.
             </span>
          </h1>

          <p className="max-w-3xl mx-auto text-indigo-100/60 text-xl md:text-2xl leading-relaxed mb-16 font-medium">
             A secure, university-verified marketplace. Monetize skills and build your pro-portfolio before graduation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link 
              href="/register" 
              className="group relative w-full sm:w-auto px-12 py-6 bg-white/5 backdrop-blur-2xl text-white font-black text-xl rounded-3xl border border-white/20 shadow-2xl hover:bg-white hover:text-blue-950 transition-all duration-500 animate-[float_3s_ease-in-out_infinite] neon-glow"
            >
              Join the Marketplace
            </Link>
            <Link 
              href="/jobs" 
              className="w-full sm:w-auto px-12 py-6 bg-white/10 backdrop-blur-md text-white font-black text-xl rounded-3xl border border-white/10 hover:bg-white/20 transition-all duration-500"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Glimpse (Glassmorphic) */}
      <section className="py-40 px-8 relative overflow-hidden bg-white/2 backdrop-blur-3xl border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
           {[
             { title: "Smart Match", text: "Skill intersection scoring using our Riviera engine.", color: "cyan" },
             { title: "Verified Identity", text: "Secure institutional verification with .edu validation.", color: "purple" },
             { title: "Secure Escrow", text: "Transactional state management for every student project.", color: "pink" }
           ].map((feat, i) => (
             <div key={i} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl hover:border-cyan-400/50 transition-all duration-500 group">
                <div className={`w-14 h-14 bg-${feat.color}-400/20 rounded-2xl mb-8 flex items-center justify-center text-${feat.color}-400 group-hover:shadow-[0_0_20px] transition-all`}>
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{feat.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed">{feat.text}</p>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
