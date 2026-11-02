import { handle } from "@/lib/server/product";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const dispatch = async (
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) => handle(request, (await params).path);
export {
  dispatch as GET,
  dispatch as POST,
  dispatch as PATCH,
  dispatch as DELETE,
};
