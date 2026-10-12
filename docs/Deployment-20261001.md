# Current production update — 2026-10-02

Production remains <https://watchnest-rho.vercel.app>. Runtime candidate `abd02f0a95e4fc6dc4d52acc86feea8e9b5b7132`, tree `21a4410e020d3a113554121ed7aadbaa51c0a494`, deployment `dpl_RmmefptK3oaJcbiKQDtKhjNBCAYk` and CI run 57 are exact and green. The private server-only YouTube credential is configured; real production metadata lookup succeeds and client-bundle scans contain no credential. Hosted migration `20261002020000_atomic_child_admission` coordinates PIN-setting mutation and child-session admission transactionally. Full state and evidence limits: [Qualification-20261002.md](Qualification-20261002.md).

The preceding 2026-10-01 text is historical. Mandatory child PIN setup and missing YouTube configuration are superseded. Final release still requires secure Parent UI traversal, successful real-device playback/escape-path observation, iPad Safari and complete visual/cold acceptance.

## First production checkpoint — 2026-10-01

URL: https://watchnest-rho.vercel.app

Dedicated Vercel project: `prj_tQi2cBAosldposlx61FcwnwDJ8OG`, existing Avromy team. Production branch: `product-completion-20260930`. First READY deployment: `dpl_93GTqMsTLZfpXGxRVb4L6RfouG9q`, source `12c7051351ebde40fd7ce3ca674bea97be87d920`. GitHub CI41 succeeded for that source. Main remains historical baseline; no main merge is implied.

Production environment contains Supabase URL, existing publishable key, existing server secret and exact APP_URL. Server secret stored privately as unrevealable Secret; no values in repository/evidence. YouTube key remains missing. No new paid subscription or analytics integration.

Supabase dedicated database and recovery: HostedDatabase-20261001.md. Named hourly maintenance job1 actually succeeded once at 03:17 UTC. Site URL is production; allowed recovery redirect is exactly /login/reset. Email enabled, confirmation on, anonymous sign-in/manual linking off. Free templates cannot be customized without SMTP/Pro; current source successor supports default fragment recovery through verified server exchange. No delivery/recovery acceptance yet.

Actual browser homepage and empty Parent setup load. Credential-free screenshot `watchnest-live-parent-setup-1790825640996.jpg`, persistent evidence ID `libfile_5ad1301dd82481919ea918919f497832`, file ID `file_00000000111081f5a74d7480591e8546`; bound to first deployed candidate only. No final visual acceptance implied. Auth users, parent households and child profiles all count0 at this checkpoint.

Next: deploy the recovery successor commit, inspect READY/source and affected live routes, owner creates private Parent password with avromy@gmail.com and confirms email; initialize Miri/Ari/Benny/Eli, securely set child PINs, configure dedicated YouTube API key, execute real product spine and isolation. GoogleCloud tab currently unavailable after one ordinary reload; no circumvention. Continue independent lanes while access is pending.

Rollback: preceding first READY deployment is the known basic-render candidate, not a certified family release. Keep its deployment ID; rollback only WatchNest aliases/project if an actual regression occurs. Database migrations are append-only and remain applied; no destructive schema reset/data purge. Recover provider versions by recorded applied names/content, not blind filename replay.

This is IN PROGRESS, not Founder Review Ready. No live family accounts, playback/device or whole-product quality certification.
