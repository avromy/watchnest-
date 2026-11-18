# Daily timer independent security review

**CURRENT: scoped source PASS bound to immutable source `6619bf920b0ea69fece24b4ada4b6901035cbc55`, whole tree `1c30d36bcc26a90ad141f8082fd08e7f65d55e29`.** All eight reviewed file hashes independently match that commit and current bytes. Exact hashes/subtrees are in the JSON receipt. This is not hosted/physical release approval. Original preliminary FAIL/TSEC01 evidence is retained below as historical evidence. Root remains sole implementation/release owner. Reviewer did not edit application source, apply migrations, deploy, read credentials, alter family data or inspect peer verdicts.

## Historical preliminary FAIL — TSEC01: configured time-zone semantics

The existing Parent settings API validates zones using Intl, while the new period helper originally used PostgreSQL text AT TIME ZONE. Their accepted forms do not always mean the same zone. Actual local reproduction: Intl +03:00 renders12UTC as15:00, original SQL renders09:00; original SQL7AM boundary is10UTC rather than04UTC. Intl CST canonicalizes to America/Chicago (July12UTC→07:00), whereas PostgreSQL abbreviation CST gives06:00. PST similarly differs by one summer hour.

At the preliminary checkpoint, Root accepted the finding; numeric repair and API canonicalization were present but alias handling and independent closure remained pending. This historical failure is superseded only by the repair/reacceptance section below, not erased.

## Other reviewed boundaries

The database owns time, stored period identity and per-profile FOR UPDATE lock. Ownership/archive predicates and service-role-only SECURITY INVOKER helpers/RPCs are present; client time is not an authorization parameter. Reset replenishes pending daily allowance without clearing explicit Parent block or Pause; no rollover. First Child use starts the shared wall-clock window, Parent read does not. End/Disable legacy adapters retain a physical past-deadline marker so old clients cannot misinterpret a logical-off Parent lock as unlimited access. The new server playback/progress paths await authoritative resolution before granting access. Individual-video assignment, Parent/PIN, origin, sibling and Safe Playback guards were not weakened in the reviewed diff.

The exact ChildPlayer diff contains the state-type union plus truthful TimeUp copy and Back to Library/profile links only; iframe/API lifecycle, sandbox, continuous approved identity and navigation containment remain the same. Real fullscreen stopping is still a physical gate. New Library refresh polling remains a UI authorization snapshot, not cumulative watched-minute tracking.

## Independently executed tests

Targeted current SQL+TS snapshot run passed50/50, exit0. Log: `/workspace/scratch/b4fb31747e8d/daily-timer-security-targeted.log`. The receipt records exact bytes at this checkpoint. Tests cover bounds, exhaustion/renewal, DST, no one-off recurrence, block/Pause/Disable, legacy deny markers, wrong-family/archive/permissions and restart. PGlite Promise.all calls execute serially: useful idempotence evidence, not actual two-connection PostgreSQL contention proof.

## Limits / follow-up

No hosted migration, real family mutation, physical iPad/Safari/YouTube playback or native-fullscreen stop is certified. Start/Extend retain distinct authorized command semantics, without a request-ID exactly-once transport guarantee; automatic reset/config/End/Pause idempotence is a separate bounded claim. The preliminary TimeUp wording observation was addressed with truthful recovery copy and a Back to Library link; returning to Library rechecks access.

The preliminary reacceptance/freeze request is now satisfied by the repair and exact binding below. Full app/browser/visual and actual release gates remain Root-owned and separate.


## Repair and independent reacceptance

TSEC01 is CLOSED for the repaired finite source. ISO numeric offsets now use PostgreSQL's interval overload with the ISO sign; named IANA/Etc zones retain their rules. The measured69 no-slash legacy alias set maps to actual Intl canonical-region meanings, including summer/winter CST/PST differences. Future Parent timezone writes canonicalize through Intl, while the SQL mapping handles existing stored aliases and old-writer coexistence. Tests validate the actual Intl hour/minute/second at SQL-returned reset instants, not only equal table spellings. Offset variants and exact CST/PST/EST/MST instants are frozen. No silent New York fallback was introduced.

The Parent control reuses its resolver's single post-lock database instant rather than sampling again after the period check; the new cross7AM clock-read specimen independently checks one linearization instant. Root's read-only Library refresh now uses a no-store GET that skips playback acknowledgements, so it cannot overwrite another playing tab's active flag. Player POST acknowledgement remains separate. Responses validate allowed/revision/serverNow; failed Library refresh denies its local snapshot rather than creating time. No iframe/player lifecycle change was found in the current source diff.

Independent targeted execution passed126/126, exit0: SQL integration and TS access snapshots. Original50/50 run and the preliminary failure classification remain preserved in JSON history. The reacceptance log and its hash are recorded; it is outside Playwright output cleanup. Root full app/E2E/build/visual/hosted evidence is separate and not claimed by this reviewer.

### Defined command-ordering boundary

Root deliberately retains existing server-arrival linearizable Parent-command authority. An authenticated Parent Start/Resume arriving later can deliberately authorize access, even if its UI view was old; there is no expected-revision/CAS guard or exactly-once request transport guarantee. This was challenged and classified as a documented limitation/optional future improvement, not a Child/auth bypass. Automatic reset, Child polling and Extend cannot clear a Parent block. Revisions order Child snapshots/acknowledgements, not Parent intent timestamps.

The source FOR UPDATE lock covers resolution/control through transaction commit. PostgreSQL's primary row-lock documentation states conflicting writers/lockers wait and subsequently read the updated row: https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS . This is source-design support, not a substitute for actual multi-connection stress testing. PGlite's serialized concurrent-call specimen and restart test remain honestly bounded.

No remaining material source/security defect is confirmed within these reviewed hashes. Hosted schema/configuration, real family mutation, native iPad/Safari/PWA/YouTube playback and fullscreen End now remain outside this verdict. No production promotion or physical PASS is granted. Bind the final immutable source/tree and rerun affected checks if any recorded source changes.


## Final exact-candidate binding

Independent comparison verified every current receipt file hash against `git show 6619bf920b0ea69fece24b4ada4b6901035cbc55:<path>` and current bytes. The 126/126 independently executed targeted tests therefore cover these unchanged immutable files. SQL SHA256: `95d27cc0acd2a7757b2891f624b2f65b9762981be69f21f1bbf144df4e4cd6df`; SQL test SHA256: `fc12b0500bc0edd4c4a420fde7a8680d9455417cbddb63e4a9e426a378371c15`. No remaining material source defect was confirmed in this scope. Any material implementation change invalidates affected acceptance. This document is evidence, not authorization to bypass hosted/real-device gates.
