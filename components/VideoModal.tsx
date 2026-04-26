"use client";

import { useEffect } from "react";

type Props = {
  url: string;
  title: string;
  onClose: () => void;
};

export default function VideoModal({ url, title, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-medium text-sm truncate pr-4">{title}</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0 text-xl leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <video
          src={url}
          controls
          autoPlay
          preload="metadata"
          className="w-full rounded-xl bg-black aspect-video"
        />
      </div>
    </div>
  );
}
