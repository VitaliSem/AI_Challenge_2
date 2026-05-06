CREATE OR REPLACE FUNCTION public.get_approved_event_feedback(_event_id uuid)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  rating smallint,
  comment text,
  created_at timestamp with time zone,
  reporter_id uuid,
  reporter_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.target_id AS event_id,
    r.rating,
    r.reason AS comment,
    r.created_at,
    r.reporter_id,
    p.name AS reporter_name
  FROM public.reports r
  LEFT JOIN public.profiles p ON p.id = r.reporter_id
  WHERE r.target_type = 'event'
    AND r.target_id = _event_id
    AND r.status = 'approved'
    AND r.rating IS NOT NULL
  ORDER BY r.created_at DESC;
$$;