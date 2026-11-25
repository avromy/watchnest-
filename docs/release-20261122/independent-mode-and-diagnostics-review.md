# Independent mode and diagnostics source review — 2026-11-22

**Scope/result: PASS, bounded source/security review.** Exact frozen candidate `98f3987c6dc7016b5de82ac6c13596cf46a7bff0`, verified src tree `48639fc4e485d99004dfad03428fcd83457d0578`. Compared actual Git diff against repaired baseline `0aac62ea0dd42d1f1301d98a4651d8b8f05e7394` after the new object became available locally. Independent reviewer; no implementation, hosted, family-data, permission or deployment mutation.

| Reviewed file | Frozen Git blob |
|---|---|
| src/lib/server/product.ts | a1bbdb19bb94658bed84b5accc84812768087950 |
| src/components/parent/ParentApp.tsx | 4df9fe436bb2f8646d2db15e80b2dfebe3be6124 |

## Diagnostics delta

The entire server delta consists of two constant check-context arguments: `child-session-ack` and `child-progress-record`. The existing check helper still logs only context, error code (or unknown) and upstream status (or503); it does not start logging messages, SQL details, tokens, user/session/profile identifiers, request bodies or viewing positions. The constants improve safe operation identification without creating child viewing telemetry.

Response bodies/statuses, RPC names/arguments, same-origin checks, authentication, device/profile binding, rate limits, server session resolution, acknowledgement revision/playback gating, assignments, freshness, Made-for-Kids classification and watched0 raw-bookmark behavior are unchanged. Generic check failures still become sanitized Failure503; this delta does not claim to fix or uniquely explain historical unknown503/P0001 events.

## Mode ownership path

Parent ChildSettings adds local Simple/Standard selection, initialized from persisted profile mode with Standard fallback, and sends it only through the existing explicit Save PATCH. Rendering or changing the select alone does not mutate server state. Shared act handles failure and reload; success is shown after confirmed action plus refresh.

The server already accepts only `simple` or `standard` through its existing enum schema. Parent route dispatch verifies Parent authority before entering parent/profiles; PATCH parses the profile UUID, checks owned active profiles, and updates with both profile ID and authenticated parent ID predicates. An attacker-controlled selector cast is not a server permission boundary. It cannot switch sibling identities or change approval membership, Parent PIN requirements, timer mode, playback containment or video assignment. Sending existing pin_enabled retains the prior form behavior; security RPC revokes child sessions only if PIN configuration actually changes, so changing presentation mode alone does not require weakening that security function.

No new role grant, public client, secret exposure, authentication bypass, SQL function, migration, telemetry or default approval behavior was added. This review assesses ownership/security and explicit mutation semantics, not whether the visual mode design is optimal or real-device usable.

## Evidence and limits

`git diff --check 0aac 98f3987c -- src` passed. A whole-repository whitespace check reports trailing spaces inside captured historical build/error logs; those are evidence artifacts, not a changed source/security defect. No unchanged tests were rerun. Controller-reported400 unit pass, new3 workflow passes and19 affected-browser rerun remain separate controller evidence, with no independent hosted proof inferred here.

Authority applied: current Founder scope, app governance and the bounded Supabase0.1.2 security/source receipt documented in independent-incident-rca.md. This review does not certify unresolved universal/visual/hosted/physical gates. No new material security concern found in the inspected delta; product release hold and historical crash-attribution limits remain as recorded by the coordinating lane.


## Successor source binding — 2fba8871

Independently read the complete source delta from98f3987c to `2fba88712bd74c868e27ff5d0e0f067332340507`. Verified successor src tree `c7aa895727fa7301c4f6d39835c42b7dce5e44c0`, ParentApp blob `60e78bd6c5ad1894c3ca38172dd9affd6a5747a2`, and unchanged server product blob `a1bbdb19bb94658bed84b5accc84812768087950`.

The only application delta adds a local error when the existing ChildSettings Save act returns false: “Save could not be confirmed. Please retry.” This is a deliberate feedback change, not byte/behavioral equivalence for failure presentation. The server/ownership/privacy/safety conclusions above are unchanged. The new branch neither mutates data nor retries automatically; it preserves the draft and does not claim success. The wording remains accurate when a mutation may have succeeded but its subsequent refresh failed, because shared act returns false in either case. Existing shared shell error feedback remains available.

`git diff --check 98f3987c 2fba8871 -- src` passed. No unchanged tests rerun. Controller reports7 focused browser passes and preserved400 unit results; CI170 was running at this review boundary. These remain controller evidence, not independently observed hosted/physical proof. **Bounded source/security PASS extends to successor2fba8871 for the reviewed delta; release/hosted/physical acceptance remains outside this report.**
