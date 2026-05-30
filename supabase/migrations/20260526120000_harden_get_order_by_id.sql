-- Hardens get_order_by_id: removes the customer_email DEFAULT NULL bypass.
-- Previously, calling the RPC without an email argument skipped the email
-- check entirely, letting an attacker who guessed an 8-char UUID prefix
-- pull order data without owning the email. Email is now required.

DROP FUNCTION IF EXISTS public.get_order_by_id(text, text);

CREATE OR REPLACE FUNCTION public.get_order_by_id(
  order_id text,
  customer_email text
)
RETURNS TABLE (
  id uuid,
  event_title text,
  event_type text,
  event_date date,
  package_name text,
  total_price numeric,
  order_status text,
  payment_status text,
  created_at timestamptz,
  preferred_delivery_date date,
  client_email text,
  deposit_paid boolean,
  balance_paid boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  search_id text;
BEGIN
  -- Email is required; empty/null returns nothing (no enumeration oracle).
  IF customer_email IS NULL OR length(trim(customer_email)) = 0 THEN
    RETURN;
  END IF;

  IF order_id IS NULL OR length(trim(order_id)) = 0 THEN
    RETURN;
  END IF;

  search_id := lower(trim(replace(order_id, '#', '')));

  RETURN QUERY
  SELECT
    o.id,
    o.event_title,
    o.event_type,
    o.event_date,
    o.package_name,
    o.total_price,
    o.order_status::text,
    o.payment_status::text,
    o.created_at,
    o.preferred_delivery_date,
    o.client_email,
    o.deposit_paid,
    o.balance_paid
  FROM public.orders o
  WHERE
    (
      o.id::text = search_id
      OR o.id::text LIKE search_id || '%'
    )
    AND lower(o.client_email) = lower(customer_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_by_id(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_by_id(text, text) TO authenticated;

COMMENT ON FUNCTION public.get_order_by_id IS
  'Lookup order by ID with mandatory email verification. Returns nothing if email missing or wrong (no enumeration oracle).';
