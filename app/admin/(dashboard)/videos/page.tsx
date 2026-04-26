"use client";

import { useEffect, useRef, useState } from "react";

type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function fetchVideos() {
    const res = await fetch("/api/admin/upload-video");
    const data = await res.json();
    setVideos(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/upload-video", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de l'upload");
      setUploading(false);
      return;
    }

    setSuccess(true);
    setUploading(false);
    formRef.current?.reset();
    fetchVideos();
  }

  async function handleDelete(video: Video) {
    if (!confirm(`Supprimer "${video.title}" ?`)) return;
    await fetch("/api/admin/delete-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: video.id, url: video.url, thumbnailUrl: video.thumbnail }),
    });
    fetchVideos();
  }

  const inputClass =
    "w-full bg-black border border-white/[0.12] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff9ed5]/50 transition-colors";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-playfair text-2xl font-bold text-white mb-8">Vidéos du Mag</h1>

      {/* Upload form */}
      <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6 mb-10">
        <h2 className="font-semibold text-white mb-5">Ajouter une vidéo</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Titre *</label>
              <input name="title" required placeholder="Titre de la vidéo" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Durée (ex: 3:42)</label>
              <input name="duration" placeholder="3:42" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Courte description..."
              className={inputClass + " resize-none"}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Fichier vidéo *</label>
              <input
                name="video"
                type="file"
                accept="video/*"
                required
                className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/[0.07] file:text-white file:text-xs file:cursor-pointer hover:file:bg-white/[0.12] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Miniature (image)</label>
              <input
                name="thumbnail"
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/[0.07] file:text-white file:text-xs file:cursor-pointer hover:file:bg-white/[0.12] transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-[#ff9ed5] text-black text-sm font-semibold rounded-lg hover:bg-[#ffb3de] transition-colors disabled:opacity-50"
            >
              {uploading ? "Upload en cours…" : "Uploader la vidéo"}
            </button>
            {success && <span className="text-green-400 text-sm">✓ Vidéo ajoutée</span>}
            {error && <span className="text-red-400 text-sm">{error}</span>}
          </div>
        </form>
      </div>

      {/* Video list */}
      <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6">
        <h2 className="font-semibold text-white mb-5">
          Vidéos publiées{" "}
          <span className="text-gray-500 font-normal text-sm">({videos.length})</span>
        </h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Chargement…</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune vidéo pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-3">
            {videos.map((v) => (
              <li
                key={v.id}
                className="flex items-start gap-4 bg-black/30 border border-white/[0.06] rounded-lg p-4"
              >
                {v.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-20 h-12 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-12 bg-white/[0.05] rounded-md flex-shrink-0 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">▶</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{v.title}</p>
                  {v.duration && (
                    <p className="text-gray-500 text-xs mt-0.5">{v.duration}</p>
                  )}
                  {v.description && (
                    <p className="text-gray-600 text-xs mt-1 line-clamp-1">{v.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(v)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs flex-shrink-0"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
