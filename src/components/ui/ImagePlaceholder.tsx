import React from 'react';
import { ImageIcon } from 'lucide-react';

export interface ImagePlaceholderProps {
  alt: string;
  aspectRatio?: string;
  className?: string;
  label?: string;
}

export default function ImagePlaceholder({
  alt,
  aspectRatio = '16/9',
  className = '',
  label
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{ aspectRatio }}
      className={`flex flex-col items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full ${className}`}
    >
      <ImageIcon className="h-8 w-8 text-[#3a3a3a] mb-2" aria-hidden="true" />
      {label && <span className="text-xs text-[#555]">{label}</span>}
    </div>
  );
}
