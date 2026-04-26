"use client";

import { useState } from "react";
import VideoModal from "./VideoModal";

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
};

type Props = {
  videos: Video[];
};

export default function VideoGrid({ videos }: Props) {
  const [active, setActive] = useState<Video | null>(null);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            className="group text-left bg-[#141414] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-[#ff9ed5]/30 transition-colors"
          >
            <div className="relative aspect-video bg-black">
              {v.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                  <span className="text-gray-600 text-3xl">▶</span>
                </div>
              )}
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-[#ff9ed5]/90 flex items-center justify-center">
                  <span className="text-black text-lg ml-0.5">▶</span>
                </div>
              </div>
              {v.duration && (
                <span className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-white text-sm font-semibold leading-snug group-hover:text-[#ff9ed5] transition-colors line-clamp-2">
                {v.title}
              </p>
              {v.description && (
                <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{v.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <VideoModal
          url={active.url}
          title={active.title}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
