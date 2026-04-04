"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EscrowPaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Job not found");
      const data = await response.json();
      setJob(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      
      // Simulation Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`http://localhost:5000/api/jobs/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          status: "In Progress", 
          paymentStatus: "Funds Held" 
        }),
      });

      if (response.ok) {
        setPaid(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Simulation failed");
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Escrow Portal...</div>;

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-800 via-blue-900 to-black opacity-50 z-0"></div>
      
      <div className="max-w-xl w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3.5rem] border-2 border-white/10 shadow-2xl p-12 overflow-hidden text-center">
          
          {paid ? (
            <div className="animate-in zoom-in duration-500">
               <div className="w-32 h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-500/30">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <h2 className="text-4xl font-black text-white mb-2">Escrow Funded!</h2>
               <p className="text-emerald-300 font-bold uppercase tracking-widest text-sm">Status: Funds Held</p>
               <p className="text-white/60 mt-6 font-medium">Agreement locked. Project moved to 'In Progress'. Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                 <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                 </div>
                 <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">Escrow Security</h1>
                 <p className="text-white/50 font-bold uppercase tracking-widest text-xs">Simulated Transaction Layer</p>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 mb-10 text-left space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Project</span>
                    <span className="text-white font-black truncate max-w-[200px]">{job.title}</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Bid Amount</span>
                    <span className="text-emerald-400 text-2xl font-black">${job.budget.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Platform Fee</span>
                    <span className="text-blue-400 font-black">0% (Student Beta)</span>
                 </div>
              </div>

              <button 
                onClick={handleDeposit}
                disabled={processing}
                className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {processing ? (
                   <>
                     <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span>Verifying Nodes...</span>
                   </>
                ) : (
                   <span>Deposit to Escrow</span>
                )}
              </button>

              <p className="mt-8 text-white/30 text-xs font-bold uppercase tracking-widest">
                 Safe Academic Collaboration Network
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
