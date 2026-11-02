import { signOpaquePayload, signaturesMatch } from "./server/product-security";

export type DiscoveryCandidate = {
  videoId: string;
  boundaryKind: "topic" | "channel";
  boundary: string;
};

export function createDiscoveryCandidateToken(
  secret: string,
  profileId: string,
  videoId: string,
  boundaryKind: DiscoveryCandidate["boundaryKind"],
  boundary: string,
  now = Date.now(),
) {
  const payload = Buffer.from(
    JSON.stringify({
      profileId,
      videoId,
      boundaryKind,
      boundary,
      exp: now + 30 * 60000,
    }),
  ).toString("base64url");
  return `${payload}.${signOpaquePayload(payload, secret)}`;
}

export function readDiscoveryCandidateToken(
  secret: string,
  token: string,
  profileId: string,
  now = Date.now(),
): DiscoveryCandidate | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = signOpaquePayload(payload, secret);
  if (!signaturesMatch(signature, expected)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      value.profileId !== profileId ||
      typeof value.videoId !== "string" ||
      !/^[A-Za-z0-9_-]{11}$/.test(value.videoId) ||
      (value.boundaryKind !== "topic" && value.boundaryKind !== "channel") ||
      typeof value.boundary !== "string" ||
      !value.boundary ||
      typeof value.exp !== "number" ||
      value.exp <= now
    )
      return null;
    return {
      videoId: value.videoId,
      boundaryKind: value.boundaryKind,
      boundary: value.boundary,
    };
  } catch {
    return null;
  }
}

export function discoveryBoundaryAllowed(
  profile: {
    discover_enabled?: boolean;
    discovery_topics?: string[] | null;
    discovery_channels?: Array<{ id: string }> | null;
  },
  candidate: Pick<DiscoveryCandidate, "boundaryKind" | "boundary">,
) {
  if (!profile.discover_enabled) return false;
  return candidate.boundaryKind === "topic"
    ? (profile.discovery_topics || []).some(
        (item) =>
          item.toLocaleLowerCase() === candidate.boundary.toLocaleLowerCase(),
      )
    : (profile.discovery_channels || []).some(
        (item) => item.id === candidate.boundary,
      );
}
