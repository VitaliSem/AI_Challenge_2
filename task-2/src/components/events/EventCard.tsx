import { Link } from "react-router-dom";
import { formatEventDate, isEventPast } from "@/lib/format";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type EventCardData = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  venue?: string | null;
  online_url?: string | null;
  cover_url?: string | null;
  capacity: number;
  hosts?: { name: string; slug: string } | null;
  avg_rating?: number | null;
  rating_count?: number | null;
};

export default function EventCard({ event }: { event: EventCardData }) {
  const past = isEventPast(event.ends_at);
  return (
    <Link to={`/e/${event.id}`} className="group card-soft overflow-hidden hover:card-elevated transition-all hover:-translate-y-0.5">
      <div className="aspect-[16/9] bg-gradient-to-br from-primary-soft to-accent-soft overflow-hidden">
        {event.cover_url ? (
          <img src={event.cover_url} alt={event.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
        ) : (
          <div className="h-full w-full grid place-items-center text-primary/40">
            <Calendar className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          {past && <Badge variant="secondary">Ended</Badge>}
          {event.hosts && <span className="text-xs text-muted-foreground">by {event.hosts.name}</span>}
        </div>
        <h3 className="font-bold text-lg leading-tight line-clamp-2">{event.title}</h3>
        <div className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {formatEventDate(event.starts_at, event.ends_at)}
        </div>
        {(event.venue || event.online_url) && (
          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {event.venue || "Online"}
          </div>
        )}
        {event.capacity > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="h-3 w-3" /> {event.capacity} spots
          </div>
        )}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Star className={`h-3 w-3 ${event.rating_count ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
          {event.rating_count ? (
            <>
              <span className="font-semibold text-foreground">{Number(event.avg_rating).toFixed(1)}</span>
              <span>({event.rating_count})</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}