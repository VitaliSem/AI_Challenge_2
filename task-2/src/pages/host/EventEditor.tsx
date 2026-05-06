import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Download, Trash2 } from "lucide-react";
import { downloadFile } from "@/lib/format";

const tzList = ["UTC", "America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"];

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function EventEditor() {
  const { hostId, eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isNew = !eventId || eventId === "new";

  const [form, setForm] = useState<any>({
    title: "", description: "", starts_at: "", ends_at: "",
    timezone: "UTC", venue: "", online_url: "", capacity: 50,
    cover_url: "", state: "draft", visibility: "public", is_paid: false,
  });
  const [cover, setCover] = useState<File | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId!).maybeSingle();
      if (data) setForm({ ...data, starts_at: toLocalInput(data.starts_at), ends_at: toLocalInput(data.ends_at) });
      const { data: att } = await supabase.from("rsvps")
        .select("*").eq("event_id", eventId!).order("created_at");
      const list = att || [];
      const ids = Array.from(new Set(list.map((r: any) => r.user_id)));
      let map = new Map<string, any>();
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, name, email").in("id", ids);
        map = new Map((profs || []).map((p: any) => [p.id, p]));
      }
      setAttendees(list.map((r: any) => ({ ...r, profiles: map.get(r.user_id) || null })));
    })();
  }, [eventId, isNew]);

  const save = async (publish?: boolean) => {
    if (!user) return;
    let cover_url = form.cover_url;
    if (cover) {
      const path = `${hostId}/${Date.now()}-${cover.name}`;
      const { error: ue } = await supabase.storage.from("event-covers").upload(path, cover);
      if (!ue) cover_url = supabase.storage.from("event-covers").getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      ...form, cover_url,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      capacity: Number(form.capacity) || 0,
      host_id: hostId, created_by: user.id,
      state: publish === true ? "published" : publish === false ? "unpublished" : form.state,
    };
    if (isNew) {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      if (error) return toast.error(error.message);
      toast.success("Event created");
      navigate(`/host/${hostId}/events/${data.id}`);
    } else {
      const { error } = await supabase.from("events").update(payload).eq("id", eventId!);
      if (error) return toast.error(error.message);
      toast.success("Saved");
    }
  };

  const duplicate = async () => {
    const { id, created_at, updated_at, ...rest } = form;
    const { data, error } = await supabase.from("events").insert({ ...rest, host_id: hostId, state: "draft", title: `${form.title} (copy)` }).select().single();
    if (error) return toast.error(error.message);
    toast.success("Duplicated");
    navigate(`/host/${hostId}/events/${data.id}`);
  };

  const remove = async () => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", eventId!);
    toast.success("Deleted");
    navigate(`/host/${hostId}/dashboard`);
  };

  const exportCsv = () => {
    const rows = [["Name", "Email", "RSVP Status", "Check-in Time"]];
    attendees.forEach(a => rows.push([
      a.profiles?.name || "", a.profiles?.email || "", a.status, a.checked_in_at || "",
    ]));
    const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadFile(`attendees-${form.title || "event"}.csv`, csv, "text/csv");
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-extrabold mb-6">{isNew ? "Create event" : "Edit event"}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 card-elevated p-6 space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={5} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Starts</Label><Input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ends</Label><Input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></div>
          </div>
          <div className="space-y-2">
            <Label>Time zone</Label>
            <Select value={form.timezone} onValueChange={v => setForm({ ...form, timezone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{tzList.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Venue address</Label>
            <Input value={form.venue || ""} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. 123 Main St, Brooklyn" />
          </div>
          <div className="space-y-2">
            <Label>Or online link</Label>
            <Input value={form.online_url || ""} onChange={e => setForm({ ...form, online_url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Capacity (0 = unlimited)</Label><Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={form.visibility} onValueChange={v => setForm({ ...form, visibility: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public — discoverable</SelectItem>
                  <SelectItem value="unlisted">Unlisted — link only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cover image</Label>
            <Input type="file" accept="image/*" onChange={e => setCover(e.target.files?.[0] || null)} />
            {form.cover_url && <img src={form.cover_url} alt="" className="h-24 rounded-lg object-cover mt-2" />}
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div>
              <Label className="font-bold">Free event</Label>
              <p className="text-xs text-muted-foreground">Paid events coming soon.</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div><Switch checked={!form.is_paid} disabled /></div>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-elevated p-5 space-y-3">
            <Button className="w-full" onClick={() => save()}>Save draft</Button>
            <Button className="w-full" variant="default" onClick={() => save(true)}>Publish</Button>
            {!isNew && form.state === "published" && (
              <Button className="w-full" variant="outline" onClick={() => save(false)}>Unpublish</Button>
            )}
            {!isNew && (
              <>
                <Button className="w-full" variant="outline" onClick={duplicate}><Copy className="h-3.5 w-3.5 mr-1.5" />Duplicate</Button>
                <Button className="w-full text-destructive" variant="ghost" onClick={remove}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete</Button>
              </>
            )}
          </div>

          {!isNew && (
            <div className="card-elevated p-5 space-y-3">
              <h3 className="font-bold">Attendees ({attendees.length})</h3>
              <Button className="w-full" variant="outline" onClick={exportCsv}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
              </Button>
              <div className="max-h-64 overflow-auto space-y-1 text-sm">
                {attendees.map(a => (
                  <div key={a.id} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="truncate">{a.profiles?.name || a.profiles?.email}</span>
                    <span className="text-xs text-muted-foreground">{a.status}</span>
                  </div>
                ))}
                {attendees.length === 0 && <p className="text-muted-foreground text-xs">No RSVPs yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}