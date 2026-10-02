import ChildPlayer from "@/components/child/ChildPlayer";
export default async function Page({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <ChildPlayer key={videoId} videoId={videoId} />;
}
