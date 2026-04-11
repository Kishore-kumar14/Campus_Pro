"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface InitializeLinkProps {
  jobId: string;
  initialBudget: number;
  onClose: () => void;
}

export default function InitializeLink({ jobId, initialBudget, onClose }: InitializeLinkProps) {
  const [bidAmount, setBidAmount] = useState<number | string>(initialBudget);
  const [pitchText, setPitchText] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setBidError(null);
    const amountNum = Number(bidAmount);

    if (!amountNum || amountNum <= 0) {
      setBidError("Validation Error: Bid Vector must be greater than 0.");
      return;
    }

    if (!pitchText.trim()) {
      setBidError("Security Protocol: Strategic pitch is required.");
      return;
    }

    setIsBidding(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/jobs/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId,
          bidAmount: amountNum,
          pitchText
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.log("Handshake Failure Data:", data);
        throw new Error(data.error || "Handshake process failed.");
      }

      setBidSuccess(true);
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
      }, 2000);

    } catch (err: any) {
      console.log("Transmission Error catch block:", err);
      setBidError(err.message);
    } finally {
      setIsBidding(false);
    }
  };

  if (bidSuccess) {
    return (
      <div className="text-center py-20 relative z-10">
        <div className="w-32 h-32 bg-cyan-400/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,242,255,0.5)] border border-cyan-400/50">
          <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-5xl font-black text-white mb-4 tracking-tighter">Proposal Dispatched</h2>
        <p className="text-cyan-400/80 font-black uppercase tracking-[0.2em] text-[10px]">Awaiting Recruiter Acceptance Matrix...</p>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <h2 className="text-4xl lg:text-5xl font-black text-white mb-3 tracking-tighter">Initialize Link</h2>
      <p className="text-white/40 mb-12 font-bold uppercase tracking-widest text-[9px] leading-loose">State your terms and outline your strategic execution plan to the client.</p>

      <div className="space-y-10">
        <div className="group">
          <label className="block text-[9px] font-black text-cyan-400/50 mb-2 uppercase tracking-[0.2em] ml-1">Bid Vector ($)</label>
          <input 
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full px-6 py-4 bg-white/5 backdrop-blur-md rounded-t-xl border-b-2 border-white/20 text-white font-black text-2xl focus:border-cyan-400 outline-none transition-all placeholder:text-white/10"
            placeholder="0.00"
          />
        </div>

        <div className="group">
          <label className="block text-[9px] font-black text-cyan-400/50 mb-2 uppercase tracking-[0.2em] ml-1">Strategic Pitch</label>
          <textarea 
            rows={5}
            value={pitchText}
            onChange={(e) => setPitchText(e.target.value)}
            className="w-full px-6 py-4 bg-white/5 backdrop-blur-md rounded-t-xl border-b-2 border-white/20 text-white font-medium text-lg focus:border-cyan-400 outline-none transition-all placeholder:text-white/10 resize-none"
            placeholder="Outline tools, frameworks, and timeline..."
          />
        </div>

        {bidError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
            {bidError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-1/3 py-6 rounded-3xl text-white/40 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
          >
            Abort
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isBidding}
            className="w-full sm:w-2/3 py-6 bg-cyan-400 text-[#050505] font-black uppercase tracking-[0.2em] text-xs rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:bg-cyan-300 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center border-none"
          >
            {isBidding ? "Transmitting..." : "Send Proposal"}
          </button>
        </div>
      </div>
    </div>
  );
}
