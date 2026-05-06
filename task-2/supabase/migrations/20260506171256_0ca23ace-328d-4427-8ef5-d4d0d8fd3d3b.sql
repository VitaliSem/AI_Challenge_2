DROP POLICY IF EXISTS reports_update_team ON public.reports;
CREATE POLICY reports_update_team ON public.reports
FOR UPDATE USING ((host_id IS NOT NULL) AND public.is_host_team(auth.uid(), host_id));