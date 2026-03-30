import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MemePageBody } from "@/components/meme/MemePageBody";
import type { Meme } from "@/types";
import type { Metadata } from "next";
import { getPlatformMemeById, loadMemesDataFile, platformMemeToMeme } from "@/lib/memes/store";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const local = await getPlatformMemeById(id);
  if (local) {
    return {
      title: local.title,
      openGraph: { title: local.title, images: [local.url] },
    };
  }
  const supabase = await createClient();
  const { data } = await supabase.from("memes").select("title, url").eq("id", id).single();
  if (!data) return { title: "Meme not found" };
  return {
    title: data.title,
    openGraph: { title: data.title, images: [data.url] },
  };
}

export default async function MemePage({ params }: Props) {
  const { id } = await params;

  const localPlat = await getPlatformMemeById(id);
  if (localPlat) {
    const typedMeme = platformMemeToMeme(localPlat);
    const file = await loadMemesDataFile();
    const tagSet = new Set(typedMeme.tags);
    let picked = file.memes.filter((m) => m.id !== id && m.tags.some((t) => tagSet.has(t)));
    if (picked.length < 3) {
      picked = file.memes.filter((m) => m.id !== id);
    }
    const related = picked.slice(0, 6).map(platformMemeToMeme);
    return <MemePageBody typedMeme={typedMeme} related={related} localRanked />;
  }

  const supabase = await createClient();
  const { data: meme, error } = await supabase
    .from("memes")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !meme) notFound();

  supabase.rpc("increment_meme_views", { meme_id: id }).then(() => {});

  const { data: relatedRows } = await supabase
    .from("memes")
    .select("id, title, thumbnail_url, url, media_type, likes, views")
    .eq("category", meme.category)
    .eq("is_active", true)
    .neq("id", id)
    .order("score", { ascending: false })
    .limit(6);

  const typedMeme = meme as Meme;
  const related = (relatedRows || []) as Meme[];

  return <MemePageBody typedMeme={typedMeme} related={related} />;
}
