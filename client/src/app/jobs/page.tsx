"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function JobsMarketplace() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Web Dev" | "Design" | "Writing">("All");

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("unauthorized");

      // Fetch Jobs and User Profile concurrently for precise frontend matching
      const [jobsRes, profileRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/user/profile/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!jobsRes.ok) {
        if (jobsRes.status === 401 || jobsRes.status === 403) throw new Error("unauthorized");
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await jobsRes.json();
      const profileData = profileRes.ok ? await profileRes.json() : null;

      if (profileData?.user) {
        setUserProfile(profileData.user);
      }
      setJobs(jobsData);
    } catch (err: any) {
      setError(err.message === "unauthorized" ? "Verification Required: Please sign in with your institutional account." : "Failed to connect to hub.");
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (job: any, userSkills: string[] = []): number => {
    if (!userSkills.length) {
       // Mock base matching if profile hasn't configured skills yet
       return Math.floor(Math.random() * 30) + 10;
    }
    
    // Convert job corpus to easily searchable text
    const corpus = `${job.title} ${job.description} ${job.requestedSkill || ''}`.toLowerCase();
    
    let matchCount = 0;
    userSkills.forEach(skill => {
      if (corpus.includes(skill.toLowerCase())) matchCount++;
    });

    // Score based on overlap ratio + bonus for any hit, bounded to 98% for realism
    let score = Math.round((matchCount / Math.max(userSkills.length, 1)) * 60);
    if (matchCount > 0) score += 35;
    
    return Math.min(Math.max(score, 15), 98);
  };

  // Process filters and calculate scores
  const processedJobs = jobs
    .filter(job => filterType === "All" || (job.category && job.category === filterType))
    .filter(job => !searchQuery || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(job => ({ ...job, frontendMatchScore: calculateMatchScore(job, userProfile?.skills) }))
    .sort((a, b) => b.frontendMatchScore - a.frontendMatchScore);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden font-sans pt-24 pb-32 px-6">
      
      {/* RIVIERA MESH BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] animate-blob-cw"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] animate-blob-ccw"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Navigation / Back Link */}
        <div className="flex justify-start mb-12">
           <Link href="/dashboard" className="group flex items-center space-x-3 text-cyan-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors">
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Return to Command Center</span>
           </Link>
        </div>
        
        {/* Header & The Search Hub */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-10">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 neon-gradient-pill text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 text-white shadow-[0_0_15px_rgba(0,242,255,0.4)]">
               Live Marketplace
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Discovery <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">Hub.</span></h1>
            <p className="text-white/40 font-bold max-w-xl uppercase tracking-widest text-[10px] leading-relaxed">
               Bridge the gap between academic theory and professional execution. Find projects that match your unique skill intersection.
            </p>
          </div>
          
          <div className="w-full lg:w-[450px]">
             {/* Glowing Search Bar */}
             <div className="relative w-full group">
                <input 
                  type="text"
                  placeholder="Search live projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-8 py-5 bg-white/5 backdrop-blur-md rounded-[2.5rem] text-white font-bold tracking-wide outline-none border border-white/10 transition-all focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,242,255,0.3)] placeholder:text-white/20"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-400 opacity-50 group-focus-within:opacity-100 transition-opacity">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
             </div>

             {/* Category Pills */}
             <div className="flex space-x-3 mt-6">
               {["All", "Web Dev", "Design", "Writing"].map((type) => (
                 <button
                   key={type}
                   onClick={() => setFilterType(type as any)}
                   className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all glass-ultra hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] ${
                     filterType === type 
                       ? "bg-purple-600/30 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                       : "text-white/40"
                   }`}
                 >
                   {type}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* State Display */}
        {error && (
          <div className="mb-12 p-8 glass-ultra border-red-400/30 flex flex-col items-center text-center rounded-[3rem]">
             <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-[0_0_20px_rgba(248,113,113,0.3)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             </div>
             <p className="text-red-400 font-bold mb-6 tracking-widest uppercase text-xs">{error}</p>
             {error.includes("sign in") && (
               <Link href="/login" className="px-10 py-5 bg-cyan-400 text-[#050505] rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                  Verify Access
               </Link>
             )}
          </div>
        )}

        {/* Job Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 glass-ultra animate-pulse rounded-[3rem]"></div>
            ))
          ) : processedJobs.length === 0 && !error ? (
            <div className="lg:col-span-2 py-32 text-center glass-ultra rounded-[3rem]">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
               </div>
               <h3 className="text-2xl font-black text-white/30 uppercase tracking-[0.3em] mb-2">Target Not Found</h3>
               <p className="text-white/20 font-bold tracking-widest text-[10px] uppercase">No projects match your current intelligence matrix.</p>
            </div>
          ) : (
            processedJobs.map((job, idx) => (
              <div 
                key={job._id} 
                className="glass-ultra group p-12 flex flex-col hover:scale-[1.02] transition-all duration-500 rounded-[3.5rem] hover:border-cyan-400/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between items-start gap-6 mb-10">
                  <div>
                    <h3 className="text-4xl font-black text-cyan-400 mb-4 leading-tight tracking-tighter group-hover:drop-shadow-[0_0_10px_rgba(0,242,255,0.4)] transition-all">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xs font-black border border-purple-400/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        {job.postedBy?.fullName?.[0] || "C"}
                      </div>
                      <span className="text-[10px] font-black text-neon-purple uppercase tracking-[0.2em] flex items-center">
                        {job.postedBy?.fullName || "Verified Recruiter"}
                        <svg className="w-3.5 h-3.5 text-purple-400 ml-1.5 fill-current" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                      </span>
                    </div>
                  </div>
                  
                  {/* EMERALD MATCH BADGE */}
                  {userProfile?.role !== 'Client' && (
                    <div className={`px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-700 whitespace-nowrap ${
                      job.frontendMatchScore >= 75 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                        : "bg-white/5 text-white/30 border-white/10"
                    }`}>
                      {job.frontendMatchScore >= 75 && <span className="mr-1 inline-block animate-pulse">⚡</span>}
                      {job.frontendMatchScore}% Match
                    </div>
                  )}
                </div>

                <p className="text-white/40 font-bold mb-10 line-clamp-3 leading-loose text-sm h-20">
                  {job.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 block mb-2">
                      {job.jobType === "Monetary" ? "Proposed Budget" : "Skill Constraint"}
                    </span>
                    
                    {/* SHIMMERING GOLD BUDGET PILL */}
                    <span className={`inline-block px-4 py-1.5 rounded-xl font-black tracking-widest text-sm shadow-[0_0_15px_rgba(252,211,77,0.2)] ${
                       job.jobType === "Monetary" ? "bg-gradient-to-r from-amber-500 to-amber-300 text-[#050505]" : "bg-white/10 text-white"
                    }`}>
                      {job.jobType === "Monetary" ? `$${job.budget.toLocaleString()}` : job.requestedSkill}
                    </span>
                  </div>
                  
                  {/* GRADIENT ACTION BUTTON */}
                  <Link href={`/jobs/${job._id}`} className="px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-[0_10px_30px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_10px_40px_-5px_rgba(59,130,246,0.6)] transition-all active:scale-95 group-hover:scale-105">
                    {userProfile?.role === 'Client' ? "Review Proposals" : "View Matrix"}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
