# Own-profile PIN-off browser regression scope

New test file: e2e/no-pin-entry.spec.ts only; no production source edits by this reviewer. Run gated on controller's final build-ready signal.

Seven browser-only synthetic contract cases: own active PIN-off normal entry and picker/library reload; repeated real pointer taps while admission held pending; rejected-network error and retry; simulated offline plus browser offline/reconnect; sibling PIN-off still Parent PIN gated; Parent Mode remains PIN gated; server-style remote End now refusal survives retry/reload.

Fixture owns fake Benny current-profile state and intercepts API calls. No real family data, credentials, auth attempt counters, session persistence or DB writes. No-PIN calls assert missing passcode and parentPin properties. Parent-handoff synthetic PIN1234 is solely an in-test value. These tests cannot certify backend authorization/rate-limit/counter behavior; separate server/DB evidence is required.

Isolated runner config: docs/no-pin-lockout-20261123/browser/no-pin.config.mts; port3127; one worker; isolated results/ and results.json. Does not use shared test-results/. Required command after controller build-ready: npm run test:e2e -- --config docs/no-pin-lockout-20261123/browser/no-pin.config.mts

Captured screenshots are viewport renders of synthetic browser states, not hosted/device acceptance. Binding attachments record actual ChildLogin source SHA-256, actual .next/BUILD_ID and screenshot SHA-256. Independent final rendered review is separate; no producer self-certification.
