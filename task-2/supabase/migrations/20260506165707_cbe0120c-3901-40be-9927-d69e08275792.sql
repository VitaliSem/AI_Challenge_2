CREATE OR REPLACE FUNCTION public.get_events_ratings(_event_ids uuid[])
RETURNS TABLE(event_id uuid, avg_rating numeric, rating_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.target_id AS event_id,
         ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
         COUNT(*) AS rating_count
  FROM public.reports r
  WHERE r.target_type = 'event'
    AND r.status = 'approved'
    AND r.rating IS NOT NULL
    AND r.target_id = ANY(_event_ids)
  GROUP BY r.target_id;
$$;