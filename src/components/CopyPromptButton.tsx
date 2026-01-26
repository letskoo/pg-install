"use client";

import { useState } from "react";

interface CopyPromptButtonProps {
  text: string;
  label?: string;
}

export default function CopyPromptButton({
  text,
  label = "Copy Prompt",
}: CopyPromptButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1200);
    } catch {
      alert("복사 실패");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
    >
      {isCopied ? "Copied!" : label}
    </button>
  );
}
