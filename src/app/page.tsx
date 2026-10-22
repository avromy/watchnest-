import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const jar = await cookies();
  if (
    jar.has("wn_device") ||
    jar.has("wn_child") ||
    jar.has("wn_parent") ||
    jar.has("wn_refresh")
  )
    redirect("/watch");
  redirect("/login");
}
