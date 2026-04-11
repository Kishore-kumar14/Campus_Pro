"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

type Milestone = {
  title: string;
  date: string;
  amount: number;
};

export default function CreateJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "Monetary" as "Monetary" | "Skill-Swap",
    budget: 0,
    requestedSkill: "",
    milestones: [] as Milestone[],
  });

  const [tempMilestone, setTempMilestone] = useState<Milestone>({
    title: "",
    date: "",
    amount: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addMilestone = () => {
    if (!tempMilestone.title || !tempMilestone.date || tempMilestone.amount <= 0) return;
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, tempMilestone],
      budget: prev.budget + Number(tempMilestone.amount),
    }));
    setTempMilestone({ title: "", date: "", amount: 0 });
  };

  const removeMilestone = (index: number) => {
    const milestoneToRemove = formData.milestones[index];
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
      budget: prev.budget - milestoneToRemove.amount,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to post a job.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      router.push("/jobs");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900 leading-tight">Step 1: The Basics</h2>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white"
                placeholder="e.g., Build a Mobile App Prototype"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white"
                placeholder="Describe the project goals, requirements, and deliverables..."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900 leading-tight">Step 2: Reward Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData((prev) => ({ ...prev, jobType: "Monetary" }))}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  formData.jobType === "Monetary"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="text-xl font-bold text-blue-900 mb-1">Monetary</div>
                <p className="text-sm text-slate-600">Pay the student via milestones and budget.</p>
              </button>
              <button
                onClick={() => setFormData((prev) => ({ ...prev, jobType: "Skill-Swap" }))}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  formData.jobType === "Skill-Swap"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="text-xl font-bold text-blue-900 mb-1">Skill-Swap</div>
                <p className="text-sm text-slate-600">Swap your skill for their help (Free).</p>
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900 leading-tight">
              {formData.jobType === "Monetary" ? "Step 3: Define Milestones" : "Step 3: Skill Requirements"}
            </h2>

            {formData.jobType === "Monetary" ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <h3 className="font-bold text-slate-800">Add a Milestone</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Title (e.g., Design Phase)"
                      value={tempMilestone.title}
                      onChange={(e) => setTempMilestone({ ...tempMilestone, title: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-slate-900 bg-white"
                    />
                    <input
                      type="date"
                      value={tempMilestone.date}
                      onChange={(e) => setTempMilestone({ ...tempMilestone, date: e.target.value })}
                      className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-slate-900 bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Amount ($)"
                      value={tempMilestone.amount || ""}
                      onChange={(e) => setTempMilestone({ ...tempMilestone, amount: Number(e.target.value) })}
                      className="px-4 py-2 rounded-lg border border-slate-200 outline-none text-slate-900 bg-white"
                    />
                  </div>
                  <button
                    onClick={addMilestone}
                    type="button"
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Add Milestone
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.milestones.map((ms, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div>
                        <div className="font-bold text-slate-800">{ms.title}</div>
                        <div className="text-xs text-slate-500">{ms.date} • ${ms.amount}</div>
                      </div>
                      <button onClick={() => removeMilestone(idx)} className="text-red-500 hover:text-red-600 font-bold text-sm">Remove</button>
                    </div>
                  ))}
                  <div className="text-right text-lg font-bold text-blue-900 pt-2 font-mono">
                    Total Budget: ${formData.budget}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Requested Skill</label>
                <input
                  type="text"
                  name="requestedSkill"
                  value={formData.requestedSkill}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 bg-white"
                  placeholder="e.g., Python, Graphic Design, etc."
                />
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-900 leading-tight">Step 4: Final Review</h2>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-6">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Project Details</div>
                <div className="text-2xl font-bold text-slate-800">{formData.title}</div>
                <div className="text-slate-600 mt-2 text-sm italic">"{formData.description}"</div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Type</div>
                  <div className="font-bold text-blue-900">{formData.jobType}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {formData.jobType === "Monetary" ? "Budget" : "Swap For"}
                  </div>
                  <div className="font-bold text-blue-900">
                    {formData.jobType === "Monetary" ? `$${formData.budget}` : formData.requestedSkill}
                  </div>
                </div>
              </div>

              {formData.jobType === "Monetary" && formData.milestones.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Milestone Progress</div>
                  <div className="space-y-2">
                    {formData.milestones.map((ms, i) => (
                      <div key={i} className="flex justify-between text-sm py-1 border-b border-white">
                        <span className="text-slate-700">{ms.title}</span>
                        <span className="font-bold text-slate-800">${ms.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-20 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 flex">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-500 ${
                step >= i ? "bg-blue-600" : ""
              }`}
            ></div>
          ))}
        </div>

        <div className="p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="min-h-[400px] flex flex-col">
            {renderStep()}

            <div className="mt-auto flex justify-between gap-4 pt-10">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition"
                >
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  disabled={
                    (step === 1 && (!formData.title || !formData.description)) ||
                    (step === 3 && (formData.jobType === "Monetary" ? formData.milestones.length === 0 : !formData.requestedSkill))
                  }
                  onClick={() => setStep(step + 1)}
                  className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition disabled:opacity-30 disabled:shadow-none"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition flex justify-center items-center"
                >
                  {loading ? "Posting..." : "Confirm & Post Job"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
