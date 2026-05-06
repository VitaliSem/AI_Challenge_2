import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import EventCard, { EventCardData } from "@/components/events/EventCard";
import { fetchEventRatings } from "@/lib/ratings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Sparkles } from "lucide-react";

export default function Explore() {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [includePast, setIncludePast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("events")
        .select("id, title, starts_at, ends_at, venue, online_url, cover_url, capacity, hosts(name, slug)")
        .eq("state", "published")
        .eq("visibility", "public")
        .eq("hidden", false)
        .order("starts_at", { ascending: true });

      if (!includePast) query = query.gte("ends_at", new Date().toISOString());
      if (q) query = query.ilike("title", `%${q}%`);
      if (loc) query = query.or(`venue.ilike.%${loc}%,location_text.ilike.%${loc}%`);

      const { data } = await query;
      const list = (data as any[]) || [];
      const ratings = await fetchEventRatings(list.map(e => e.id));
      setEvents(list.map(e => ({ ...e, ...(ratings[e.id] || {}) })));
      setLoading(false);
    };
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [q, loc, includePast]);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-soft via-background to-accent-soft border-b border-border">
        <div className="container py-16 md:py-20 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary mb-4">
            <Sparkles className="h-3 w-3" /> Free community events
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Find your next gathering.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover meetups, workshops, and pop-ups happening near you. RSVP in seconds.
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="card-soft p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-8">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search events…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <Input className="md:w-56" placeholder="Location" value={loc} onChange={e => setLoc(e.target.value)} />
          <div className="flex items-center gap-2 px-2">
            <Switch id="past" checked={includePast} onCheckedChange={setIncludePast} />
            <Label htmlFor="past" className="text-sm cursor-pointer">Include past</Label>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground text-center py-16">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 card-soft">
            <h3 className="text-xl font-bold">No events yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to host one!</p>
            <Button asChild className="mt-4"><a href="/host/new">Become a host</a></Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}