import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackSection({ eventId, hasRsvp }: { eventId: string; hasRsvp: boolean }) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [mine, setMine] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = async () => {
    const { data } = await supabase.from("feedback").select("*, profiles:user_id(name)").eq("event_id", eventId).order("created_at", { ascending: false });
    setItems(data || []);
    if (user) {
      const m = data?.find((d: any) => d.user_id === user.id);
      setMine(m);
      if (m) { setRating(m.rating); setComment(m.comment || ""); }
    }
  };

  useEffect(() => { load(); }, [eventId, user]);

  const submit = async () => {
    if (!user) return;
    const { error } = await supabase.from("feedback").upsert({
      event_id: eventId, user_id: user.id, rating, comment,
    }, { onConflict: "event_id,user_id" });
    if (error) return toast.error(error.message);
    toast.success("Thanks for your feedback!");
    load();
  };

  return (
    <div className="card-soft p-6 space-y-4">
      <h2 className="text-xl font-bold">Feedback</h2>
      {user && hasRsvp && (
        <div className="space-y-3 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} type="button">
                <Star className={`h-6 w-6 ${n <= rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Share your thoughts (optional)" value={comment} onChange={e => setComment(e.target.value)} />
          <Button onClick={submit}>{mine ? "Update" : "Submit"} feedback</Button>
        </div>
      )}
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No feedback yet.</p>
      ) : items.map((f: any) => (
        <div key={f.id} className="border-t pt-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className={`h-3.5 w-3.5 ${n <= f.rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
              ))}
            </div>
            <span className="text-sm font-semibold">{f.profiles?.name || "Attendee"}</span>
          </div>
          {f.comment && <p className="text-sm text-foreground/80">{f.comment}</p>}
        </div>
      ))}
    </div>
  );
}