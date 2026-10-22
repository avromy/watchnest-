import { NextResponse } from "next/server";
import { db, parent } from "@/lib/server/product";
import { sameOrigin } from "@/lib/server/product-security";

const bucket = "watchnest-profile-photos";
const types: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const maxPhotoBytes = 2 * 1024 * 1024;
const maxMultipartBytes = maxPhotoBytes + 128 * 1024;

function hasImageSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  if (type === "image/webp")
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}

function response(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ profileId: string }> },
) {
  try {
    if (!sameOrigin(request))
      return response({ error: "Open this action from WatchNest." }, 403);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > maxMultipartBytes)
      return response({ error: "Choose a photo smaller than 2 MB." }, 413);
    const owner = await parent();
    const { profileId } = await context.params;
    const client = db();
    const profile = await client
      .from("profiles")
      .select("id,photo_path")
      .eq("id", profileId)
      .eq("parent_id", owner.id)
      .is("archived_at", null)
      .maybeSingle();
    if (profile.error || !profile.data)
      return response({ error: "Child profile unavailable." }, 404);
    const form = await request.formData();
    const file = form.get("photo");
    if (!(file instanceof File))
      return response({ error: "Choose a photo to upload." }, 400);
    if (!types[file.type])
      return response({ error: "Use a JPG, PNG, or WebP photo." }, 400);
    if (file.size > maxPhotoBytes)
      return response({ error: "Choose a photo smaller than 2 MB." }, 400);
    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!hasImageSignature(file.type, signature))
      return response({ error: "Use a valid JPG, PNG, or WebP photo." }, 400);
    const path = `${owner.id}/${profileId}.${types[file.type]}`;
    const upload = await client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600",
      });
    if (upload.error)
      return response(
        { error: "The photo could not be saved. Try another image." },
        503,
      );
    const update = await client
      .from("profiles")
      .update({ photo_path: path })
      .eq("id", profileId)
      .eq("parent_id", owner.id);
    if (update.error)
      return response(
        { error: "The photo could not be connected to this profile." },
        503,
      );
    if (profile.data.photo_path && profile.data.photo_path !== path)
      await client.storage.from(bucket).remove([profile.data.photo_path]);
    return response({ ok: true });
  } catch {
    return response(
      { error: "The photo could not be saved. Please try again." },
      500,
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ profileId: string }> },
) {
  try {
    if (!sameOrigin(request))
      return response({ error: "Open this action from WatchNest." }, 403);
    const owner = await parent();
    const { profileId } = await context.params;
    const client = db();
    const profile = await client
      .from("profiles")
      .select("photo_path")
      .eq("id", profileId)
      .eq("parent_id", owner.id)
      .is("archived_at", null)
      .maybeSingle();
    if (profile.error || !profile.data)
      return response({ error: "Child profile unavailable." }, 404);
    if (profile.data.photo_path)
      await client.storage.from(bucket).remove([profile.data.photo_path]);
    const update = await client
      .from("profiles")
      .update({ photo_path: null })
      .eq("id", profileId)
      .eq("parent_id", owner.id);
    if (update.error)
      return response({ error: "The photo could not be removed." }, 503);
    return response({ ok: true });
  } catch {
    return response(
      { error: "The photo could not be removed. Please try again." },
      500,
    );
  }
}
