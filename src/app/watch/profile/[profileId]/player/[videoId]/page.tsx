import { redirect } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ profileId: string; videoId: string }>;
}) {
  const { videoId } = await params;
  redirect(`/watch/player/${encodeURIComponent(videoId)}`);
}
