-- Approved-only playback is a product invariant, not an optional household mode.
with changed as (
  update public.parents
  set safe_playback_enabled=true
  where safe_playback_enabled=false
  returning id
)
insert into public.audit_events(
  parent_id,actor_type,action,entity_type,entity_id,metadata_json
)
select id,'system','safe_playback_made_mandatory','parent',id,
  jsonb_build_object('reason','Approved-only child playback invariant')
from changed;

alter table public.parents
  alter column safe_playback_enabled set default true;

alter table public.parents
  drop constraint if exists parents_safe_playback_required;

alter table public.parents
  add constraint parents_safe_playback_required
  check (safe_playback_enabled=true);
