import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";

export default function HostReports() {
  const { hostId } = useParams();
  const [reports, setReports] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  const load = async () => {
    const { data: r } = await supabase.from("reports").select("*").eq("host_id", hostId!).eq("status", "open");
    setReports(r || []);
    const { data: g } = await supabase.from("gallery_photos")
      .select("*, events!inner(host_id)").eq("status", "pending").eq("events.host_id", hostId!);
    setPending(g || []);
  };
  useEffect(() => { load(); }, [hostId]);

  const hide = async (rep: any) => {
    if (rep.target_type === "event") {
      await supabase.from("events").update({ hidden: true }).eq("id", rep.target_id);
    } else {
      await supabase.from("gallery_photos").update({ status: "rejected" }).eq("id", rep.target_id);
    }
    await supabase.from("reports").update({ status: "hidden" }).eq("id", rep.id);
    toast.success("Hidden");
    load();
  };
  const dismiss = async (rep: any) => {
    await supabase.from("reports").update({ status: "dismissed" }).eq("id", rep.id);
    load();
  };
  const approveReport = async (rep: any) => {
    await supabase.from("reports").update({ status: "approved" }).eq("id", rep.id);
    toast.success("Approved — rating counts toward the event average");
    load();
  };

  const approve = async (id: string) => {
    await supabase.from("gallery_photos").update({ status: "approved" }).eq("id", id);
    toast.success("Approved");
    load();
  };
  const reject = async (id: string) => {
    await supabase.from("gallery_photos").update({ status: "rejected" }).eq("id", id);
    load();
  };

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold mb-6">Moderation</h1>
      <Tabs defaultValue="gallery">
        <TabsList>
          <TabsTrigger value="gallery">Gallery ({pending.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="gallery" className="mt-4 space-y-3">
          {pending.length === 0 ? <p className="text-muted-foreground">All caught up!</p> : pending.map(p => (
            <div key={p.id} className="card-soft p-3 flex items-center gap-3">
              <img src={p.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <div className="flex-1 text-sm text-muted-foreground">Pending photo</div>
              <Button size="sm" onClick={() => approve(p.id)}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => reject(p.id)}>Reject</Button>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="reports" className="mt-4 space-y-3">
          {reports.length === 0 ? <p className="text-muted-foreground">No open reports.</p> : reports.map(r => (
            <div key={r.id} className="card-soft p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold">{r.target_type} · {r.target_id.slice(0, 8)}</div>
                {typeof r.rating === "number" && r.rating > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">{r.rating}/5</span>
                  </div>
                )}
                {r.reason && <div className="text-sm text-muted-foreground mt-1">{r.reason}</div>}
              </div>
              {r.target_type === "event" && typeof r.rating === "number" && r.rating > 0 && (
                <Button size="sm" onClick={() => approveReport(r)}>Approve</Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => hide(r)}>Hide</Button>
              <Button size="sm" variant="ghost" onClick={() => dismiss(r)}>Decline</Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}