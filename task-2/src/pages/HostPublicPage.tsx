import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EventCard, { EventCardData } from "@/components/events/EventCard";
import { fetchEventRatings } from "@/lib/ratings";
import { Mail } from "lucide-react";

export default function HostPublicPage() {
  const { slug } = useParams();
  const [host, setHost] = useState<any>(null);
  const [events, setEvents] = useState<EventCardData[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: h } = await supabase.from("hosts").select("*").eq("slug", slug!).maybeSingle();
      setHost(h);
      if (h) {
        const { data: ev } = await supabase.from("events")
          .select("id, title, starts_at, ends_at, venue, online_url, cover_url, capacity")
          .eq("host_id", h.id).eq("state", "published").eq("visibility", "public").eq("hidden", false)
          .order("starts_at", { ascending: true });
        const list = (ev as any[]) || [];
        const ratings = await fetchEventRatings(list.map(e => e.id));
        setEvents(list.map(e => ({ ...e, ...(ratings[e.id] || {}) })));
      }
    };
    load();
  }, [slug]);

  if (!host) return <div className="container py-16 text-muted-foreground">Loading…</div>;

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-soft to-accent-soft border-b border-border">
        <div className="container py-12 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-card overflow-hidden grid place-items-center text-3xl font-extrabold text-primary border-4 border-card shadow-lg">
            {host.logo_url ? <img src={host.logo_url} alt={host.name} className="h-full w-full object-cover" /> : host.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold">{host.name}</h1>
            {host.bio && <p className="text-muted-foreground mt-2 max-w-2xl">{host.bio}</p>}
            {host.contact_email && (
              <a href={`mailto:${host.contact_email}`} className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-semibold">
                <Mail className="h-3.5 w-3.5" /> {host.contact_email}
              </a>
            )}
          </div>
        </div>
      </section>
      <div className="container py-10">
        <h2 className="text-xl font-bold mb-4">Upcoming & past events</h2>
        {events.length === 0 ? (
          <p className="text-muted-foreground">No published events yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}