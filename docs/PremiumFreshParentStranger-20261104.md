# Fresh Parent stranger test — 2026-11-04

## Frozen first impressions (before fixtures/source)

Evidence inspected: ci135 synthetic browser renders at 390×844: parent-sign-in-full, parent-dashboard-top, parent-inbox-top, parent-add-video-full. This is a preliminary corpus; final verdict requires final candidate rendered and interactive evidence.

The calm cream/green palette and clear large headings feel reassuring. Sign in is immediately understandable; show password and recovery are available without hunting. No visible new-account path means a truly unregistered parent cannot infer how to join, though an invited parent's login may be the intended entry.

As a returning busy parent, I see a Requests badge and “1 waiting for you.” I expect Requests to let me decide what my child can watch quickly. The inbox topic request says “Lego trains,” with “Find a video” and “Not now.” I expect Find a video to preserve this topic, give me results, let me inspect one, choose the child, approve it, and return to a visibly resolved request. “Not now” sounds temporary, not a permanent rejection.

As a low-confidence new parent, I would press Add videos (or the large Add to the library button), use Paste video links because I already know a video my child likes, preview it before approval, assign it to one child, then verify it appears in the library. I expect a malformed link to produce a specific recoverable explanation without losing my work. I expect no approval from merely opening a preview. “Move existing family picks” is not self-explanatory; I would avoid it on my first session.

## Independently chosen tasks

1. Returning busy parent: log in, open Requests, follow the existing Lego trains request to search, inspect a result, and approve it for the requesting child; verify request outcome and library availability.
2. Low-confidence new parent: open Add videos, paste a mistaken link, recover with a valid known link, preview, approve to one child, and verify the library confirmation/presence.
3. Login confidence: enter credentials, reveal/hide password, submit, and verify landing state.

## Acceptance boundary

These impressions are frozen before fixture access. Assertions below will exercise synthetic browser paths only. This document does not certify provider integration, live data, physical devices, or interactive acceptance from static imagery.
