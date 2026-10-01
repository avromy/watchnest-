# Database — current checkpoint

Apply all five migrations in order. For the already configured hosted project, inspect [hosted receipts](HostedDatabase-20261001.md) first and do not replay applied files:

1. `202607060001_initial_schema.sql`
2. `20260930192030_secure_family_product.sql`
3. `20260930235307_progress_metadata_freshness.sql`
4. `20260930235928_metadata_retention_maintenance.sql`

The second migration preserves baseline tables and adds verified parent linkage/family code, profile passcode hashes/modes, video audience status, family library links, child sessions, collections, requests, viewing events and distributed rate limits. All 14 tables enable RLS and revoke anon/authenticated access. Six SECURITY INVOKER RPCs are service-role-only: rate limit, atomic approval, atomic assignment, removal, authorized progress recording and metadata maintenance.

The third migration repeats the explicit non-MFK/fresh-past-under-one-day rule inside the locked progress transaction. The fourth prepares a service-only metadata-retention function. Actual hourly scheduling is separate; see MetadataOperations and the bounded operations script. Never infer hosted cron activation or advisors from local SQL tests.

Active assignment uniqueness is enforced with a partial unique index. Household foreign-key/validation checks prevent cross-family assignment and collection linkage. Progress remains unique per profile/video; recording additionally requires an active assignment, playable status and explicit non-made-for-kids classification. Child cookies contain random credentials whose SHA-256 hashes, expiration and revocation state are stored in the database; raw child credentials are never stored.

`supabase/seed.sql` is a historical test fixture with placeholder video IDs and three unrelated scaffold profiles. **Never run it in production.** Founder initialization creates Miri, Ari, Benny and Eli. These rows are not live until real migrations and verified sign-in run.

Integration coverage uses PGlite PostgreSQL with test-only auth schema/roles and pgcrypto adaptation. This validates SQL syntax, constraints, RLS/grants, RPC denial, assignments and progress, but does not substitute for deployed Supabase Auth/RLS/advisor checks.

5. `20261001030558_hosted_security_indexes.sql` conditionally removes client execution of the platform automatic-RLS function and adds foreign-key indexes.
