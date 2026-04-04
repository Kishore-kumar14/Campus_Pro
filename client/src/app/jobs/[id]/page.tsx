"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function JobDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal & Bidding States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number | string>("");
  const [proposal, setProposal] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  // Escrow States
  const [isSecureFlow, setIsSecureFlow] = useState(false);
  const [isEscrowLoading, setIsEscrowLoading] = useState(false);
  const [escrowSuccess, setEscrowSuccess] = useState(false);

  // User Context
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchJobDetails();
    const token = localStorage.getItem("token");
    if (token) {
      // Mocking verification context since JWT decode isn't on frontend yet
      setCurrentUser({ id: "current-user-id", isVerified: true }); 
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Target project not found in database.");
      const data = await response.json();
      setJob(data);
      setBidAmount(data.budget || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);
    
    // Validation
    const amountNum = Number(bidAmount);
    if (!amountNum || amountNum <= 0) {
      setBidError("Your bid must be greater than $0.");
      return;
    }
    if (!proposal.trim()) {
      setBidError("A proposal pitch is required to synchronize.");
      return;
    }

    setIsBidding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/bid`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount: amountNum, proposal }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bidding process failed.");

      setBidSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSecureFlow(true); // Trigger Escrow Layer
      }, 1500);
    } catch (err: any) {
      setBidError(err.message);
    } finally {
      setIsBidding(false);
    }
  };

  const handleEscrowSimulate = async () => {
    setIsEscrowLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: "In Progress", paymentStatus: "Funds Held" }),
      });

      if (!response.ok) throw new Error("Failed to secure connection.");
      
      setEscrowSuccess(true);
      setTimeout(() => {
         router.push("/dashboard");
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEscrowLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-cyan-400 font-black tracking-widest uppercase">Initializing Layer...</div>;
  if (error || !job) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-bold uppercase tracking-[0.2em]">{error || "404 - Job Vault Null"}</div>;

  const canBid = currentUser?.isVerified && job.postedBy?._id !== currentUser?.id && job.status === "Open";

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-6 relative overflow-hidden font-sans">
      
      {/* BACKGROUND MESH: THE RIVIERA DEPTH */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[140px] animate-blob-cw"></div>
         <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] animate-blob-ccw"></div>
      </div>

      {/* ESCROW SUCCESS TOAST */}
      {escrowSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="glass-ultra text-emerald-400 px-8 py-5 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] border border-emerald-400/30 flex items-center space-x-6">
              <div className="w-12 h-12 bg-emerald-400/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                 <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                 <p className="font-black text-white text-lg uppercase tracking-[0.2em]">Success: Funds Held in Escrow</p>
                 <p className="text-emerald-400/80 text-[10px] font-black uppercase tracking-widest">Project Synced • Forwarding to Hub</p>
              </div>
           </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* NAV ROUTING */}
        <Link href="/jobs" className="inline-flex items-center text-cyan-400 font-black uppercase tracking-[0.2em] mb-12 hover:text-cyan-300 transition-colors group text-sm">
          <svg className="w-5 h-5 mr-3 group-hover:-translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Return to Marketplace
        </Link>

        {/* HIGH FIDELITY DEEP DIVE BOARD */}
        <div className="glass-ultra rounded-[4rem] shadow-2xl p-14 lg:p-20 overflow-hidden relative group">
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
            <div className="flex-1">
              <span className="px-5 py-2 bg-purple-600/20 text-purple-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-purple-400/30 mb-8 inline-block shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                {job.jobType} Matrix
              </span>
              <h1 className="text-5xl lg:text-7xl font-black text-cyan-400 leading-[1.1] tracking-tighter drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                 {job.title}
              </h1>
            </div>

            {/* SECURE PROJECT BUTTON (SIMULATED ESCROW) */}
            {isSecureFlow && !escrowSuccess && (
               <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/40 p-8 rounded-[3rem] text-center shadow-[0_0_50px_rgba(0,242,255,0.1)] w-full lg:w-96 animate-in fade-in zoom-in">
                  <h3 className="text-xl font-black text-white mb-2">Proposal Accepted</h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/50 mb-6 font-bold">Client is ready to initialize the project.</p>
                  <button 
                     onClick={handleEscrowSimulate}
                     disabled={isEscrowLoading}
                     className="w-full py-5 bg-cyan-400 text-[#050505] font-black uppercase text-xs tracking-[0.2em] rounded-2xl flex items-center justify-center hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:shadow-[0_0_30px_rgba(0,242,255,0.6)]"
                  >
                     {isEscrowLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#050505]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Synchronizing...
                        </>
                     ) : (
                        "Secure Project"
                     )}
                  </button>
               </div>
            )}
          </div>

          {/* GLOWING METRICS ROW */}
          <div className="flex flex-wrap gap-6 mb-16 pb-16 border-b border-white/10">
             <div className="glass-ultra px-8 py-5 rounded-[2rem] flex flex-col hover:-translate-y-1 transition-transform border-amber-400/30 shadow-[0_0_15px_rgba(252,211,77,0.1)]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/50 mb-1.5">Project Scope / Budget</span>
                <span className="text-xl font-black text-amber-400 tracking-widest">
                   {job.jobType === "Monetary" ? `$${job.budget.toLocaleString()}` : job.requestedSkill}
                </span>
             </div>
             
             <div className="glass-ultra px-8 py-5 rounded-[2rem] flex flex-col hover:-translate-y-1 transition-transform border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400/50 mb-1.5">Est. Deadline</span>
                <span className="text-xl font-black text-purple-400 tracking-widest">14 Days</span>
             </div>

             <div className="glass-ultra px-8 py-5 rounded-[2rem] flex flex-col hover:-translate-y-1 transition-transform border-cyan-400/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/50 mb-1.5">Active Proposals</span>
                <span className="text-xl font-black text-cyan-400 tracking-widest">{Math.floor(Math.random() * 5) + 1} Pending</span>
             </div>
          </div>

          {/* PROJECT DESCRIPTION */}
          <div className="mb-16">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-[0.3em] flex items-center">
               <span className="w-12 h-1 bg-cyan-400 mr-5 shadow-[0_0_10px_rgba(0,242,255,0.5)]"></span>
               Matrix Overview
            </h3>
            <p className="text-white/60 leading-relaxed text-xl whitespace-pre-wrap font-medium">{job.description}</p>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center font-black border border-purple-400/30">
                {job.postedBy?.fullName?.[0] || 'R'}
              </div>
              <div className="flex flex-col">
                 <span className="text-white font-black text-lg tracking-tight flex items-center">
                    {job.postedBy?.fullName || "Verified Recruiter"}
                    <svg className="w-4 h-4 text-purple-400 ml-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                 </span>
                 <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Institutional Publisher</span>
              </div>
            </div>

            {!isSecureFlow && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 disabled={!canBid}
                 className="w-full md:w-auto px-16 py-6 bg-cyan-400 text-[#050505] font-black rounded-[2.5rem] shadow-[0_0_30px_rgba(34,211,238,0.4)] animate-pulse-neon hover:bg-cyan-300 transition-all active:scale-95 uppercase tracking-widest text-xs disabled:opacity-30 disabled:pointer-events-none"
               >
                 {job.status !== "Open" ? "Vault Closed" : "Submit Proposal"}
               </button>
            )}
          </div>
        </div>
      </div>

      {/* RIVIERA BIDDING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#1a0b2e]/80 backdrop-blur-3xl" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative glass-ultra w-full max-w-2xl rounded-[4rem] p-16 shadow-[0_0_50px_rgba(168,85,247,0.2)] border-purple-500/20 animate-in fade-in zoom-in duration-500 overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full"></div>
            
            {bidSuccess ? (
              <div className="text-center py-20 relative z-10">
                 <div className="w-32 h-32 bg-cyan-400/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,242,255,0.5)] border border-cyan-400/50">
                    <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                 </div>
                 <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">Proposal Dispatched</h2>
                 <p className="text-cyan-400/80 font-black uppercase tracking-[0.2em] text-[10px]">Awaiting Recruiter Acceptance Matrix...</p>
              </div>
            ) : (
              <div className="relative z-10">
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tighter">Initialize Link</h2>
                <p className="text-white/40 mb-12 font-bold uppercase tracking-widest text-[9px] leading-loose">State your terms and outline your strategic execution plan to the client.</p>

                <form className="space-y-10" onSubmit={handleBidSubmit}>
                  
                  <div className="group">
                    <label className="block text-[9px] font-black text-neon-purple mb-2 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-cyan-400">Bid Vector ($)</label>
                    <input 
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur-md rounded-t-xl border-b-2 border-white/20 text-white font-black text-2xl focus:border-cyan-400 focus:shadow-[0_4px_15px_-4px_rgba(0,242,255,0.4)] outline-none transition-all placeholder:text-white/10"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-[9px] font-black text-neon-purple mb-2 uppercase tracking-[0.2em] ml-1 transition-colors group-focus-within:text-cyan-400">Strategic Pitch</label>
                    <textarea 
                      rows={5}
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 backdrop-blur-md rounded-t-xl border-b-2 border-white/20 text-white font-medium text-lg leading-relaxed focus:border-cyan-400 focus:shadow-[0_4px_15px_-4px_rgba(0,242,255,0.4)] outline-none transition-all placeholder:text-white/10 resize-none"
                      placeholder="Outline tools, frameworks, and timeline..."
                    />
                  </div>

                  {bidError && (
                     <div className="p-6 bg-red-400/10 border border-red-400/30 text-red-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl animate-pulse">
                        {bidError}
                     </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="w-full sm:w-1/3 py-6 rounded-3xl text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all border-2 border-transparent"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      disabled={isBidding}
                      className="w-full sm:w-2/3 py-6 bg-cyan-400 text-[#050505] font-black uppercase tracking-[0.2em] text-xs rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:bg-cyan-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center border-none"
                    >
                      {isBidding ? "Transmitting..." : "Send Proposal"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
