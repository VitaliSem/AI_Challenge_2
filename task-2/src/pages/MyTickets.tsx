import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { formatEventDate } from "@/lib/format";
import { toast } from "sonner";

export default function MyTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("rsvps")
      .select("*, events!inner(*)")
      .eq("user_id", user.id)
      .gte("events.ends_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    setTickets(data || []);
  };
  useEffect(() => { load(); }, [user]);

  const cancel = async (id: string) => {
    await supabase.from("rsvps").delete().eq("id", id);
    toast.success("RSVP cancelled");
    load();
  };

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-extrabold mb-6">My Tickets</h1>
      {tickets.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="text-muted-foreground">You haven't RSVP'd to any upcoming events yet.</p>
          <Button asChild className="mt-4"><Link to="/">Explore events</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="card-soft p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 space-y-1">
                <Link to={`/e/${t.events.id}`} className="font-bold text-lg hover:text-primary">{t.events.title}</Link>
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {formatEventDate(t.events.starts_at, t.events.ends_at)}
                </div>
                {t.events.venue && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {t.events.venue}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={t.status === "confirmed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {t.status === "confirmed" ? "Confirmed" : "Waitlisted"}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">{t.ticket_code}</span>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancel(t.id)}>Cancel</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}