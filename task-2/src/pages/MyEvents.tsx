import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatEventDate, isEventPast } from "@/lib/format";
import { Plus } from "lucide-react";

export default function MyEvents() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [hostFilter, setHostFilter] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: m } = await supabase.from("host_members")
        .select("*, hosts(*)").eq("user_id", user.id);
      setMemberships(m || []);
      const ids = (m || []).map((x: any) => x.host_id);
      if (ids.length) {
        const { data: ev } = await supabase.from("events").select("*, hosts(name, slug)").in("host_id", ids).order("starts_at", { ascending: false });
        setEvents(ev || []);
      }
    })();
  }, [user]);

  const roles = useMemo(() => {
    const r: Record<string, string> = {};
    memberships.forEach(m => { r[m.host_id] = m.role; });
    return r;
  }, [memberships]);

  const filtered = events.filter(e =>
    (!q || e.title.toLowerCase().includes(q.toLowerCase())) &&
    (!hostFilter || e.host_id === hostFilter)
  );

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">My Events</h1>
        <Button asChild><Link to="/host/new"><Plus className="h-4 w-4 mr-1.5" />Become a host</Link></Button>
      </div>

      {memberships.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="text-muted-foreground">You're not part of any host team yet.</p>
          <Button asChild className="mt-4"><Link to="/host/new">Create a host profile</Link></Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input className="max-w-xs" placeholder="Search events…" value={q} onChange={e => setQ(e.target.value)} />
            <select className="rounded-lg border border-input bg-background px-3 text-sm" value={hostFilter} onChange={e => setHostFilter(e.target.value)}>
              <option value="">All hosts</option>
              {memberships.map(m => <option key={m.host_id} value={m.host_id}>{m.hosts.name}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {memberships.map(m => (
              <Link key={m.id} to={`/host/${m.host_id}/dashboard`} className="card-soft px-4 py-2 text-sm font-semibold hover:card-elevated">
                {m.hosts.name} <span className="text-xs text-muted-foreground ml-1">· {m.role}</span>
              </Link>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(e => (
              <div key={e.id} className="card-soft p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={e.state === "published" ? "default" : "secondary"}>{e.state}</Badge>
                    {isEventPast(e.ends_at) && <Badge variant="outline">past</Badge>}
                  </div>
                  <div className="font-bold">{e.title}</div>
                  <div className="text-sm text-muted-foreground">{formatEventDate(e.starts_at, e.ends_at)} · {e.hosts?.name}</div>
                </div>
                <div className="flex gap-2">
                  {roles[e.host_id] === "host" && (
                    <Button asChild size="sm" variant="outline"><Link to={`/host/${e.host_id}/events/${e.id}`}>Manage</Link></Button>
                  )}
                  <Button asChild size="sm"><Link to={`/host/${e.host_id}/events/${e.id}/check-in`}>Check-in</Link></Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="card-soft p-8 text-center text-muted-foreground">No events match.</div>}
          </div>
        </>
      )}
    </div>
  );
}