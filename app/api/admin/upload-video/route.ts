import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const videoFile = formData.get("video") as File | null;
  const thumbnailFile = formData.get("thumbnail") as File | null;
  const title = (formData.get("title") as string) || "Sans titre";
  const description = (formData.get("description") as string) || "";
  const duration = (formData.get("duration") as string) || "";

  if (!videoFile) {
    return NextResponse.json({ error: "Fichier vidéo manquant" }, { status: 400 });
  }

  const videoBlob = await put(`videos/${Date.now()}-${videoFile.name}`, videoFile, {
    access: "public",
  });

  let thumbnailUrl = "";
  if (thumbnailFile && thumbnailFile.size > 0) {
    const thumbnailBlob = await put(
      `videos/thumbnails/${Date.now()}-${thumbnailFile.name}`,
      thumbnailFile,
      { access: "public" }
    );
    thumbnailUrl = thumbnailBlob.url;
  }

  const video = await prisma.video.create({
    data: {
      title,
      description,
      url: videoBlob.url,
      thumbnail: thumbnailUrl,
      duration,
    },
  });

  return NextResponse.json(video, { status: 201 });
}

export async function GET() {
  const videos = await prisma.video.findMany({ orderBy: { publishedAt: "desc" } });
  return NextResponse.json(videos);
}
