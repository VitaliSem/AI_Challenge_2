import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Settings, Users } from "lucide-react";
import { formatEventDate, isEventPast } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function HostDashboard() {
  const { hostId } = useParams();
  const [host, setHost] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: h } = await supabase.from("hosts").select("*").eq("id", hostId!).maybeSingle();
      setHost(h);
      const { data: ev } = await supabase.from("events").select("*").eq("host_id", hostId!).order("starts_at", { ascending: false });
      const withCounts = await Promise.all((ev || []).map(async (e: any) => {
        const { data: rs } = await supabase.from("rsvps").select("status, checked_in_at").eq("event_id", e.id);
        return {
          ...e,
          going: rs?.filter((r: any) => r.status === "confirmed").length || 0,
          waitlist: rs?.filter((r: any) => r.status === "waitlisted").length || 0,
          checkedIn: rs?.filter((r: any) => r.checked_in_at).length || 0,
        };
      }));
      setEvents(withCounts);
    };
    load();
  }, [hostId]);

  const upcoming = events.filter(e => !isEventPast(e.ends_at));
  const past = events.filter(e => isEventPast(e.ends_at));

  if (!host) return <div className="container py-16 text-muted-foreground">Loading…</div>;

  return (
    <div className="container py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Host dashboard</p>
          <h1 className="text-3xl font-extrabold">{host.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to={`/host/${hostId}/team`}><Users className="h-4 w-4 mr-1.5" /> Team</Link></Button>
          <Button asChild variant="outline"><Link to={`/host/${hostId}/reports`}><Settings className="h-4 w-4 mr-1.5" /> Moderation</Link></Button>
          <Button asChild><Link to={`/host/${hostId}/events/new`}><Plus className="h-4 w-4 mr-1.5" /> New event</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <EventList items={upcoming} hostId={hostId!} empty="No upcoming events. Create your first one!" />
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <EventList items={past} hostId={hostId!} empty="No past events yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventList({ items, hostId, empty }: { items: any[]; hostId: string; empty: string }) {
  if (items.length === 0) return <div className="card-soft p-10 text-center text-muted-foreground">{empty}</div>;
  return (
    <div className="space-y-3">
      {items.map(e => (
        <div key={e.id} className="card-soft p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={e.state === "published" ? "default" : "secondary"}>{e.state}</Badge>
              {e.visibility === "unlisted" && <Badge variant="outline">unlisted</Badge>}
            </div>
            <Link to={`/host/${hostId}/events/${e.id}`} className="font-bold hover:text-primary">{e.title}</Link>
            <div className="text-sm text-muted-foreground">{formatEventDate(e.starts_at, e.ends_at)}</div>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center"><div className="font-bold text-lg">{e.going}</div><div className="text-xs text-muted-foreground">Going</div></div>
            <div className="text-center"><div className="font-bold text-lg">{e.waitlist}</div><div className="text-xs text-muted-foreground">Waitlist</div></div>
            <div className="text-center"><div className="font-bold text-lg">{e.checkedIn}</div><div className="text-xs text-muted-foreground">Checked-in</div></div>
          </div>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link to={`/host/${hostId}/events/${e.id}`}>Manage</Link></Button>
            <Button asChild size="sm"><Link to={`/host/${hostId}/events/${e.id}/check-in`}>Check-in</Link></Button>
          </div>
        </div>
      ))}
    </div>
  );
}