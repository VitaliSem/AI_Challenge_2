import { supabase } from "@/integrations/supabase/client";

export type EventRating = { avg_rating: number; rating_count: number };

export async function fetchEventRatings(eventIds: string[]): Promise<Record<string, EventRating>> {
  if (eventIds.length === 0) return {};
  const { data, error } = await supabase.rpc("get_events_ratings", { _event_ids: eventIds });
  if (error || !data) return {};
  const map: Record<string, EventRating> = {};
  for (const row of data as any[]) {
    map[row.event_id] = { avg_rating: Number(row.avg_rating), rating_count: Number(row.rating_count) };
  }
  return map;
}