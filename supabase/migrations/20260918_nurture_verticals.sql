-- Expand lead_nurture_state.vertical so live surfaces can enqueue.
-- The original CHECK (20260505) only listed boi/brai/tracr/lexaudit/docai/
-- forge/leadforge/realestate/generic. FalseEcho/SellerRadar already enqueue
-- names that fail that CHECK; CasePage/SinceFiled/BrainX/DEAL44/LeaseParse
-- need the same door.
--
-- Idempotent: drop-if-exists then add the full set.
-- Sibling files still waiting in the same SQL editor:
--   20260901_falseecho_mvp.sql
--   20260915_falseecho_pending_engine_status.sql
--   20260902_sellerradar_mvp.sql
--   20260907_sellerradar_monitor_scan_state.sql
--   20260915_leaseparse_paid_gate.sql
--   20260915_deal44_paid_room.sql
--   20260918_casepage_production.sql
--   20260918_sincefiled_production.sql

alter table public.lead_nurture_state
  drop constraint if exists lead_nurture_state_vertical_check;

alter table public.lead_nurture_state
  add constraint lead_nurture_state_vertical_check
  check (vertical in (
    'boi', 'brai', 'tracr', 'lexaudit', 'docai', 'forge', 'leadforge',
    'realestate', 'generic',
    'falseecho', 'sellerradar', 'leaseparse',
    'casepage', 'sincefiled', 'brainx', 'deal44'
  ));
