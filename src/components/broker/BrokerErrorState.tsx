import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { BrokerButton } from "./BrokerButton";

interface BrokerErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function BrokerErrorState({
  title = "Unable to load data",
  message = "A temporary connection or server issue occurred while loading this section.",
  onRetry,
  className = "",
}: BrokerErrorStateProps) {
  return (
    <div
      className={`rounded-xl border border-red-500/20 bg-[#161114] p-6 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-[#E6E8EB] mb-1">{title}</h3>
      <p className="text-xs text-[#8B94A1] max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <BrokerButton
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry
        </BrokerButton>
      )}
    </div>
  );
}
