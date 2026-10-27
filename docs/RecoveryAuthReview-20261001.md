# Independent recovery authentication challenge

Reviewer: separate fresh execution context `/root/recovery_security_cold`, supplied exact repository/candidate and source review task; no inherited Builder conversation. Source identity: `60673a781ddb8fa6aab5ca70bb1c00f23e57cb8f`, tree `700035155292c9bd6fb3931cd789d1dfd1b03b54`. Final local readback matched clean candidate. Reviewer changed no files.

Finding, medium: callback setSession accepted an unchecked refresh credential when supplied access JWT remained valid. Reproduced with actual installed auth-js2.101.1 and controlled fetch stub: only GET /user, no token refresh grant, arbitrary refresh carried through. Second getUser reverified same access. Garbage/mismatched wn_refresh could cause renewal failure or switching at renewal. No non-Founder privilege bypass demonstrated; confirmed Founder checks remained enforced.

Correction required: authenticate refresh credential through isolated refreshSession, verify its returned access remotely and compare identity to independently verified original Founder, then issue validated cookies. Actual SDK/exchange regression required; earlier mocked setSession tests did not establish this.

Other bounded observations: same-origin/cross-site POST guard; confirmed Founder checks before cookies; HTTPOnly, Strict and production Secure cookies; callback JSON returns no credentials; browser removes URL secrets promptly. Client recovery type is routing and cannot establish recovery provenance. Ordinary valid Founder sessions can authorize owner password changes; do not claim recovery-email-only authorization.

Source successor in the commit containing this report repairs the finding. Independent successor retest and deployed email/auth acceptance must be recorded in current Notion handoff. Do not treat this report as PASS for the changed candidate or live provider. Original24 dispatch/security tests passed but mock scope concealed finding.
