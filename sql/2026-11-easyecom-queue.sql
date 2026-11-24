-- EasyEcom auto-order queue: run in the Supabase SQL editor BEFORE enabling EASYECOM_ENABLED.
-- Safe to re-run.

-- 0. Sanity check - must return ZERO rows, otherwise fix duplicates before step 2.
select "orderNumber", count(*) from easyecom_order_queue group by 1 having count(*) > 1;

-- 1. New columns used by the worker.
alter table easyecom_order_queue
  add column if not exists next_retry_at     timestamptz,
  add column if not exists lease_expires_at  timestamptz,
  add column if not exists sent_at           timestamptz;

-- 2. One queue row per order, guaranteed by the database.
create unique index if not exists easyecom_order_queue_ordernumber_uniq
  on easyecom_order_queue ("orderNumber");

-- 3. Fast lookups for the sweep.
create index if not exists easyecom_order_queue_status_idx
  on easyecom_order_queue (status, next_retry_at);

-- 4. The queue's source_order_id has a foreign key to the OLD `orders` table,
--    so inserts for orders_v2 orders would be rejected. Repoint it.
--    (Run only while the queue holds no rows that reference old orders.)
alter table easyecom_order_queue
  drop constraint if exists easyecom_order_queue_source_order_id_fkey;
alter table easyecom_order_queue
  add constraint easyecom_order_queue_source_order_id_fkey
  foreign key (source_order_id) references public.orders_v2 (id);
