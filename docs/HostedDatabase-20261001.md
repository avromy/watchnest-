# Hosted database checkpoint

Dedicated project: `ysukwpeowpcixdzkexky`, existing organization `noqvkohywncueaewhlex`, us-east-1, Postgres17.11.0.002, ACTIVE_HEALTHY. Account menu verified avromy@gmail.com. Owner created the database password privately; its value was never accessed or stored by the execution agent.

Before changes, public tables and migration history were empty. Unrelated projects were untouched. No app users, profiles or videos have been populated. Backup/PITR availability and live application isolation are not certified.

Applied migration receipts:

| Hosted version | Repository source |
| --- | --- |
| 20261001030438 | 202607060001_initial_schema.sql |
| 20261001030449 | 20260930192030_secure_family_product.sql |
| 20261001030451 | 20260930235307_progress_metadata_freshness.sql |
| 20261001030452 | 20260930235928_metadata_retention_maintenance.sql |
| 20261001030624 | 20261001030558_hosted_security_indexes.sql |
| 20261001030636 | supabase/operations/enable_metadata_cron.sql (hosted name enable_metadata_cron) |

The hosted service assigns application-time migration versions; do not blindly replay the differently numbered local files. Inspect history and source names before future CLI reconciliation.

Live catalog checks: all 14 application tables have RLS enabled, no anon/authenticated table grants, and service_role data privileges. All six WatchNest RPCs are SECURITY INVOKER with fixed search_path and no anon/authenticated EXECUTE. Household constraints protect new writes; the two historical assignment constraints remain NOT VALID for old-row compatibility. The new project has no old rows.

The automatic-RLS platform event trigger introduced public EXECUTE on its SECURITY DEFINER function. The fifth migration revokes client/PUBLIC EXECUTE conditionally, preserves the trigger, and adds missing foreign-key indexes. Security advisors then reported only the 14 informational RLS-with-no-policy findings, expected for intentionally denied direct client access. See https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .

pg_cron was absent before activation. The operation enabled it and successfully invoked maintenance immediately. Job1 `watchnest-metadata-retention` is active with schedule `17 * * * *` and command `select public.wn_metadata_maintenance();`. An actual scheduled run still needs job_run_details evidence. A paused or unavailable database cannot maintain retention; continued operation/monitoring remains a gate.

Recovery: keep successfully applied migrations and continue unapplied work. Do not drop the database or undo access revocations. The optional indexes can be removed individually if a demonstrated regression requires it. Unschedule only `watchnest-metadata-retention` to stop that job; never drop pg_cron or affect unrelated jobs. Do not restore expired third-party metadata. No user data existed at this checkpoint, and no destructive rollback was attempted.

Pending: Vercel deployment/private environment, YouTube API setup, parent authentication setup/recovery URLs, secure child credentials, actual REST/RPC and two-household/sibling tests, scheduled retention evidence, real YouTube/iPad behavior and candidate-bound independent product/visual acceptance. Database setup is not product readiness.

Local regression rerun:138tests/18files passed after this migration addition. Existing tests cover the first four migrations; the fifth migration has direct hosted catalog/advisor verification. Application source bytes unchanged.
