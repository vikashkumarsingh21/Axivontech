"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BrokerOnboardingPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    
    try {
      const res = await fetch("/api/v1/broker/referral/generate", {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate referral code.");
      }
      
      router.push("/broker/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
        <Image
          src="/assets/logo/logo-full.png"
          alt="Axivon Technologies"
          width={150}
          height={36}
          className="h-8 w-auto brightness-0 invert mx-auto mb-8"
        />
        
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Axivon Partner Portal</h1>
        <p className="text-gray-400 text-sm mb-8">
          Your partner account has been created successfully. Generate your official Axivon Referral Code to start submitting leads and earning commissions.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md mb-6 text-sm text-left">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Referral Code"}
        </button>
        
        <p className="text-xs text-gray-500 mt-6">
          This code will be permanently assigned to your account and cannot be changed later.
        </p>
      </div>
    </div>
  );
}
