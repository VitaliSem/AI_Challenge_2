import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, MapPin, Users, ArrowLeft, Globe, Star } from "lucide-react";
import { formatEventDate, isEventPast, makeIcs, downloadFile } from "@/lib/format";
import { fetchEventRatings, EventRating } from "@/lib/ratings";
import { toast } from "sonner";
import TicketView from "@/components/events/TicketView";
import GallerySection from "@/components/events/GallerySection";
import FeedbackSection from "@/components/events/FeedbackSection";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function EventPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [host, setHost] = useState<any>(null);
  const [myRsvp, setMyRsvp] = useState<any>(null);
  const [counts, setCounts] = useState({ confirmed: 0, waitlisted: 0 });
  const [loading, setLoading] = useState(true);
  const [reportReason, setReportReason] = useState("");
  const [reportRating, setReportRating] = useState(0);
  const [rating, setRating] = useState<EventRating | null>(null);

  const load = async () => {
    if (!id) return;
    const { data: ev } = await supabase.from("events")
      .select("*, hosts(*)").eq("id", id).maybeSingle();
    setEvent(ev);
    setHost(ev?.hosts);
    if (ev) {
      const { data: rs } = await supabase.from("rsvps")
        .select("status").eq("event_id", id);
      setCounts({
        confirmed: rs?.filter((r: any) => r.status === "confirmed").length || 0,
        waitlisted: rs?.filter((r: any) => r.status === "waitlisted").length || 0,
      });
      if (user) {
        const { data: mine } = await supabase.from("rsvps")
          .select("*").eq("event_id", id).eq("user_id", user.id).maybeSingle();
        setMyRsvp(mine);
      }
      const r = await fetchEventRatings([id]);
      setRating(r[id] || null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user]);

  useEffect(() => {
    if (!id) return;
    const ch = supabase.channel(`ev-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps", filter: `event_id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, user]);

  // SEO
  useEffect(() => {
    if (!event) return;
    document.title = `${event.title} · Gather`;
    const set = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const [k, v] = sel.replace(/[\[\]"]/g, "").split("=");
        el.setAttribute(k, v);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', "content", (event.description || event.title).slice(0, 160));
    set('meta[property="og:title"]', "content", event.title);
    set('meta[property="og:description"]', "content", (event.description || "").slice(0, 200));
    if (event.cover_url) set('meta[property="og:image"]', "content", event.cover_url);
  }, [event]);

  const past = useMemo(() => event ? isEventPast(event.ends_at) : false, [event]);

  if (loading) return <div className="container py-16 text-muted-foreground">Loading…</div>;
  if (!event) return <div className="container py-16">Event not found.</div>;

  const rsvp = async () => {
    if (!user) { navigate(`/auth?next=/e/${id}`); return; }
    const { error } = await supabase.from("rsvps").insert({ event_id: id!, user_id: user.id, status: "confirmed" });
    if (error) return toast.error(error.message);
    toast.success("You're in! 🎉");
    load();
  };

  const cancel = async () => {
    if (!myRsvp) return;
    const { error } = await supabase.from("rsvps").delete().eq("id", myRsvp.id);
    if (error) return toast.error(error.message);
    setMyRsvp(null);
    toast.success("RSVP cancelled");
    load();
  };

  const addToCal = () => {
    const ics = makeIcs({
      title: event.title, description: event.description, location: event.venue || event.online_url,
      starts: event.starts_at, ends: event.ends_at, uid: event.id,
    });
    downloadFile(`${event.title}.ics`, ics, "text/calendar");
  };

  const submitReport = async () => {
    if (!user) { navigate(`/auth?next=/e/${id}`); return; }
    const { error } = await supabase.from("reports").insert({
      target_type: "event", target_id: event.id, reporter_id: user.id, reason: reportReason, host_id: event.host_id, rating: reportRating,
    });
    if (error) return toast.error(error.message);
    toast.success("Thanks — we'll review it.");
    setReportReason("");
    setReportRating(0);
  };

  const spotsLeft = event.capacity > 0 ? Math.max(0, event.capacity - counts.confirmed) : null;

  return (
    <div>
      <div className="container pt-6">
        <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to events
        </Link>
      </div>
      <div className="container py-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated overflow-hidden">
            <div className="aspect-[16/8] bg-gradient-to-br from-primary-soft to-accent-soft">
              {event.cover_url && <img src={event.cover_url} alt={event.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {past && <Badge variant="secondary">Ended</Badge>}
                {event.visibility === "unlisted" && <Badge variant="outline">Unlisted</Badge>}
                <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">Free</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">{event.title}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatEventDate(event.starts_at, event.ends_at)}</span>
                {event.venue && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.venue}</span>}
                {event.online_url && <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4" /> Online</span>}
                {event.capacity > 0 && <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {counts.confirmed}/{event.capacity}</span>}
                {rating && rating.rating_count > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-gold text-gold" />
                    <span className="font-semibold text-foreground">{rating.avg_rating.toFixed(1)}</span>
                    <span>({rating.rating_count} rating{rating.rating_count === 1 ? "" : "s"})</span>
                  </span>
                )}
              </div>
              {event.description && <p className="whitespace-pre-line text-foreground/90 mt-4">{event.description}</p>}
            </div>
          </div>

          {past && <FeedbackSection eventId={event.id} hasRsvp={myRsvp?.status === "confirmed"} />}
          <GallerySection eventId={event.id} hostId={event.host_id} past={past} />
        </div>

        <aside className="space-y-4">
          <div className="card-elevated p-5 space-y-3">
            {past ? (
              <div className="text-center py-2 text-muted-foreground font-semibold">This event has ended</div>
            ) : myRsvp ? (
              <>
                <Badge className={myRsvp.status === "confirmed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {myRsvp.status === "confirmed" ? "You're going!" : "On waitlist"}
                </Badge>
                <TicketView code={myRsvp.ticket_code} title={event.title} />
                <Button variant="outline" className="w-full" onClick={addToCal}>Add to calendar</Button>
                <Button variant="ghost" className="w-full text-destructive" onClick={cancel}>Cancel RSVP</Button>
              </>
            ) : (
              <>
                {spotsLeft !== null && spotsLeft === 0 ? (
                  <Button className="w-full" size="lg" onClick={rsvp}>Join waitlist</Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={rsvp}>RSVP — Free</Button>
                )}
                {spotsLeft !== null && (
                  <p className="text-xs text-center text-muted-foreground">
                    {spotsLeft > 0 ? `${spotsLeft} spots left` : "Event is full — join the waitlist"}
                  </p>
                )}
              </>
            )}
          </div>

          {host && (
            <Link to={`/h/${host.slug}`} className="card-soft p-5 flex items-center gap-3 hover:card-elevated transition">
              <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden grid place-items-center">
                {host.logo_url
                  ? <img src={host.logo_url} alt={host.name} className="h-full w-full object-cover" />
                  : <span className="font-bold text-secondary-foreground">{host.name[0]}</span>}
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hosted by</div>
                <div className="font-bold">{host.name}</div>
              </div>
            </Link>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Flag className="h-3 w-3 mr-1.5" /> Report this event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Report event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1.5">Rate this event</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReportRating(reportRating === n ? 0 : n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        <Star className={`h-6 w-6 ${n <= reportRating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-muted-foreground">{reportRating}/5</span>
                  </div>
                </div>
                <Textarea placeholder="Please leave feedback..." value={reportReason} onChange={e => setReportReason(e.target.value)} />
              </div>
              <DialogFooter><Button onClick={submitReport}>Submit</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </aside>
      </div>
    </div>
  );
}