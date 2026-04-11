"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function StudentDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [selectedJobBids, setSelectedJobBids] = useState<any[] | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [receivedBids, setReceivedBids] = useState(0);
  const [activeBids, setActiveBids] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExamMode, setIsExamMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "Network Synchronized", sub: "Action confirmed across platform." });
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchProfile();
    
    // Real-Time Sync: Refresh data when user focuses the tab
    window.addEventListener("focus", fetchProfile);
    
    if (searchParams?.get("bid") === "success") {
      setToastMessage({ title: "Proposal Dispatched!", sub: "Bid is live. Awaiting recruiter response." });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }

    return () => window.removeEventListener("focus", fetchProfile);
  }, []);


  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("unauthorized");

      const response = await fetch(`${API_BASE_URL}/api/user/profile/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data.user);
      setIsExamMode(data.user.examMode);
      if (data.receivedBids !== undefined) setReceivedBids(data.receivedBids);
      if (data.activeBids !== undefined) setActiveBids(data.activeBids);

      // Dedicated fetch logic for Client Jobs
      if (data.user?.role === 'Client') {
         try {
           const myJobsRes = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
             headers: { Authorization: `Bearer ${token}` },
           });
           if (myJobsRes.ok) {
             const myJobs = await myJobsRes.json();
             setPostedJobs(myJobs);
           }
         } catch (err) {
           console.error("Failed to fetch my-jobs:", err);
         }
      } else {
         // Student logic: Fetch their bids
          try {
            const myBidsRes = await fetch(`${API_BASE_URL}/api/jobs/proposals/my-proposals`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (myBidsRes.ok) {
              const myBidsData = await myBidsRes.json();
              setMyBids(myBidsData);
            }
          } catch (err) {
           console.error("Failed to fetch my-bids:", err);
         }
         if (data.postedJobs) setPostedJobs(data.postedJobs);
      }
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
      
      const response = await fetch(`${API_BASE_URL}/api/user/update-exam-mode`, {
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
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to update exam mode: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (err) {
      console.error("Error toggling exam mode:", err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to remove this project from the Vault?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to withdraw project");
      
      // Filter out immediately to simulate instant UI update
      setPostedJobs(prev => prev.filter(job => job._id !== jobId));
      setShowToast(true);
      setToastMessage({ title: "Project Withdrawn", sub: "Mission scrubbed from the network." });
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to securely withdraw project.");
    }
  };

  const handleReviewProposals = async (jobId: string) => {
    setSelectedJobId(jobId);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/bids`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedJobBids(data);
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (bidId: string) => {
    if (!window.confirm("Seal the link with this student? This will start the project execution.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/jobs/bids/${bidId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setToastMessage({ title: "Connection Sealed!", sub: "Project moved to Execution phase." });
        setShowToast(true);
        setSelectedJobBids(null);
        setSelectedJobId(null);
        fetchProfile(); // Refresh everything
        setTimeout(() => setShowToast(false), 4000);
      } else {
        throw new Error("Failed to accept proposal");
      }
    } catch (err) {
      console.error(err);
      alert("System sync failed during handshake.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
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
                 <p className="font-black text-white text-sm uppercase tracking-widest">{toastMessage.title}</p>
                 <p className="text-cyan-400/80 text-[10px] font-black uppercase tracking-widest">{toastMessage.sub}</p>
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
                   {profile?.role === 'Client' ? 'Verified Recruiter Elite' : 'Verified Student Elite'}
                </div>
              </div>
              <p className="text-white/30 font-black uppercase tracking-[0.3em] text-xs leading-relaxed max-w-xl">
                 {profile?.role === 'Client' 
                   ? 'Sourcing verified campus talent for top-tier project execution.' 
                   : 'Bridging the experience paradox within the CampusPro framework.'}
              </p>
            </div>
          </div>

          {profile?.role !== 'Client' && (
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
          )}
        </div>

        {/* MAIN GRID: PERFORMANCE HUB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow">
          
          <div className="lg:col-span-8 space-y-10">
            {/* PERFORMANCE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {profile?.role === 'Client' ? (
                <>
                  <div className="glass-ultra p-12 rounded-[3.5rem] flex flex-col justify-center hover-glow-purple">
                     <div className="text-6xl font-black text-white mb-3 tracking-tighter">{postedJobs.length}</div>
                     <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em]">Your Project Injections</div>
                  </div>

                  <div className="glass-ultra p-12 rounded-[3.5rem] flex flex-col justify-center relative group hover-glow-purple">
                    <div className="absolute top-6 right-8 w-2 h-2 bg-purple-400 rounded-full animate-pulse-neon"></div>
                    <div className="text-6xl font-black text-white mb-3 tracking-tighter">
                      {postedJobs.filter(j => j.status === 'In Progress').length}
                    </div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em]">Active Executions</div>
                  </div>

                  <Link href="/jobs/create" className="glass-ultra p-12 rounded-[3.5rem] flex flex-col justify-center relative group cursor-pointer hover-glow-cyan border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)] items-center text-center transition-all hover:-translate-y-2">

                    <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <div className="text-[12px] font-black text-cyan-400 uppercase tracking-[0.2em] group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">Create New Project</div>
                  </Link>
                </>
              ) : (
                <>

                  <div className="glass-ultra p-12 rounded-[3.5rem] flex flex-col justify-center hover-glow-purple">
                     <div className="text-6xl font-black text-white mb-3 tracking-tighter transition-all duration-1000">
                        {myBids ? myBids.length : 0}
                     </div>
                     <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.25em]">Bids Sent Out</div>
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
                     <div className="text-6xl font-black text-cyan-400 mb-3 tracking-tighter group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all">
                       {myBids.filter(b => b.status === 'Accepted').length}
                     </div>
                     <div className="text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.25em]">Assigned Missions</div>
                  </div>

                </>
              )}
            </div>

            {/* SKILL STACKS HUB / PROJECT MANAGEMENT */}
            <div className="glass-ultra p-14 rounded-[4rem]">
               <h3 className="text-xl font-black text-white mb-12 uppercase tracking-[0.3em] flex items-center">
                  <span className="w-12 h-0.5 bg-cyan-400 mr-6"></span>
                  {profile?.role === 'Client' ? 'Project Management Console' : 'Verified Skill Artifacts'}
               </h3>
               
               {profile?.role === 'Client' ? (
                  <div className="flex flex-col gap-4">
                    {selectedJobBids ? (
                      <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="flex justify-between items-center mb-8">
                           <h4 className="text-2xl font-black text-white uppercase tracking-wider">Candidate Stream</h4>
                           <button 
                             onClick={() => {setSelectedJobBids(null); setSelectedJobId(null);}}
                             className="text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                           >
                             ← Back to Console
                           </button>
                        </div>
                        <div className="space-y-6">
                           {selectedJobBids.length === 0 ? (
                             <div className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] p-12 border border-white/5 rounded-3xl bg-white/5 text-center">
                               Zero candidates detected in the stream.
                             </div>
                           ) : (
                             selectedJobBids.map(bid => (
                               <div key={bid._id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col md:flex-row justify-between gap-10 hover:border-cyan-400/30 transition-all">
                                 <div className="flex-grow">
                                    <div className="flex items-center gap-4 mb-4">
                                       <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 font-black text-xl">
                                          {bid.bidderId.fullName[0]}
                                       </div>
                                       <div>
                                          <h5 className="text-xl font-black text-white">{bid.bidderId.fullName}</h5>
                                          <div className="flex gap-2 mt-1">
                                             {bid.bidderId.skills?.slice(0, 3).map((s: string, i: number) => (
                                               <span key={i} className="text-[8px] font-black text-cyan-400 uppercase tracking-widest px-2 py-0.5 bg-cyan-400/10 rounded-md">{s}</span>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/5">
                                       <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-2 italic">Strategic Pitch:</p>
                                       <p className="text-xs text-white/70 leading-relaxed font-bold">{bid.proposal}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col justify-between items-end min-w-[200px]">
                                    <div className="text-right">
                                       <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Bid Vector</p>
                                       <p className="text-3xl font-black text-cyan-400 tracking-tighter">${bid.amount}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleAcceptProposal(bid._id)}
                                      className="w-full mt-6 py-3 bg-cyan-400 text-[#050505] text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white transition-all shadow-[0_10px_20px_rgba(34,211,238,0.2)]"
                                    >
                                      Seal the Link
                                    </button>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {postedJobs.length === 0 ? (
                          <div className="text-white/40 font-bold uppercase tracking-widest text-[10px] leading-loose p-8 border border-white/5 rounded-3xl bg-white/5 text-center">
                            No open projects injected into the network yet.
                          </div>
                        ) : (
                          postedJobs.map(job => (
                            <div key={job._id} className="flex flex-col md:flex-row justify-between p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors gap-4">
                              <div>
                                <h4 className="text-xl font-black text-cyan-400">{job.title}</h4>
                                <span className={`inline-block mt-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                                  job.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                                  job.status === 'In Progress' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-white/10 text-white/50'
                                }`}>
                                  {job.status === 'In Progress' ? 'EXECUTING' : job.status}
                                </span>
                              </div>
                              <div className="text-right flex flex-col justify-between items-end">
                                <div>
                                  <p className="text-sm font-black text-white">{job.jobType === 'Monetary' ? `$${job.budget}` : job.requestedSkill}</p>
                                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex space-x-3 mt-4">
                                   {job.status === 'Open' && (
                                     <button 
                                       onClick={() => handleReviewProposals(job._id)}
                                       className="px-4 py-2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-[#050505] transition-all flex items-center"
                                     >
                                       Review Proposals
                                     </button>
                                   )}
                                   <button 
                                     onClick={() => handleDeleteJob(job._id)}
                                     className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center shadow-[0_0_10px_rgba(239,68,68,0.1)] group-hover/btn:border-red-500"
                                   >
                                     <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                     Withdraw
                                   </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-12">
                     <div className="border border-white/5 bg-white/5 rounded-[3rem] p-10">
                        <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-8">Active Executions</h4>
                        <div className="space-y-4">
                           {myBids.filter(b => b.status === "Accepted").length === 0 ? (
                             <div className="text-[10px] font-black text-white/10 uppercase tracking-widest p-8 border border-white/5 border-dashed rounded-3xl text-center">
                               No active missions in your orbit.
                             </div>
                           ) : (
                             myBids.filter(b => b.status === "Accepted").map(bid => (
                               <div key={bid._id} className="p-6 bg-cyan-400/5 border border-cyan-400/20 rounded-3xl flex justify-between items-center group">
                                 <div>
                                   <div className="flex items-center gap-3 mb-2">
                                     <h5 className="text-lg font-black text-white">{bid.jobId?.title}</h5>
                                     <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-md animate-pulse">ASSIGNED</span>
                                   </div>
                                   <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Client: {bid.jobId?.postedBy?.fullName}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-lg font-black text-white tracking-tighter">${bid.amount}</p>
                                    <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest">Executing Mission</p>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                        
                        <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mt-12 mb-8">Pending Transmissions</h4>
                        <div className="space-y-4">
                           {myBids.filter(b => b.status === "Pending").length === 0 ? (
                             <div className="text-[10px] font-black text-white/10 uppercase tracking-widest p-8 border border-white/5 border-dashed rounded-3xl text-center">
                               Zero transmission signals detected.
                             </div>
                           ) : (
                             myBids.filter(b => b.status === "Pending").map(bid => (
                               <div key={bid._id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center">
                                 <div>
                                   <h5 className="text-lg font-black text-white/60 mb-1">{bid.jobId?.title}</h5>
                                   <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Awaiting Client Seal</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-lg font-black text-white/40 tracking-tighter">${bid.amount}</p>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                     </div>

                     <div className="pt-8">
                        <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-8">Verified Skill Artifacts</h3>
                        <div className="flex flex-wrap gap-5">
                           {profile?.skills?.map((skill: string, i: number) => (
                             <div key={i} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold text-white/50 hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:text-cyan-400 transition-all cursor-default uppercase tracking-widest">
                                {skill}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

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

      {/* FIXED LOGOUT ANCHOR */}
      <div className="fixed bottom-10 left-10 z-50">
         <button 
           onClick={handleLogout}
           className="px-8 py-4 glass-ultra border-red-500/30 text-red-500 rounded-3xl flex items-center space-x-4 shadow-[0_10px_30px_rgba(239,68,68,0.15)] group hover:bg-red-500/10 hover:border-red-500 transition-all duration-500"
         >
            <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:translate-x-1 transition-transform">Terminate Session</span>
         </button>
      </div>

    </div>
  );
}

