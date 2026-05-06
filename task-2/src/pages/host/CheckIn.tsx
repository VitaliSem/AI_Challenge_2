import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Undo2, ScanLine, Keyboard, Download, CheckCircle2, Clock } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { downloadFile } from "@/lib/format";

type Row = {
  id: string;
  user_id: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  ticket_code: string;
  checked_in_at: string | null;
  created_at: string;
  profile?: { name: string | null; email: string | null; avatar_url: string | null };
};

function initials(name?: string | null, email?: string | null) {
  const s = (name || email || "?").trim();
  const parts = s.split(/\s+/);
  return (parts[0]?.[0] || "?").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

export default function CheckIn() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [code, setCode] = useState("");
  const [last, setLast] = useState<Row | null>(null);
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  const load = async () => {
    const { data: ev } = await supabase.from("events").select("*").eq("id", eventId!).maybeSingle();
    setEvent(ev);
    const { data: rs } = await supabase
      .from("rsvps")
      .select("id, user_id, status, ticket_code, checked_in_at, created_at")
      .eq("event_id", eventId!)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });
    const list = (rs || []) as Row[];
    const ids = Array.from(new Set(list.map(r => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, email, avatar_url")
        .in("id", ids);
      const map = new Map((profs || []).map((p: any) => [p.id, p]));
      list.forEach(r => { r.profile = map.get(r.user_id); });
    }
    setRows(list);
  };

  useEffect(() => { load(); }, [eventId]);

  useEffect(() => {
    const ch = supabase.channel(`ci-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rsvps", filter: `event_id=eq.${eventId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [eventId]);

  const checkedIn = rows.filter(r => r.checked_in_at);
  const confirmed = rows.filter(r => r.status === "confirmed");
  const waitlist = rows.filter(r => r.status === "waitlisted");
  const remaining = Math.max(0, confirmed.length - checkedIn.length);

  const checkInCode = async (raw: string) => {
    let c = raw.trim().toUpperCase();
    const m = c.match(/[A-Z0-9]{4,}/g);
    if (m) c = m[m.length - 1];
    if (!c) return;
    const { data: r } = await supabase
      .from("rsvps")
      .select("id, user_id, status, ticket_code, checked_in_at, created_at")
      .eq("event_id", eventId!).eq("ticket_code", c).maybeSingle();
    if (!r) { toast.error(`Ticket ${c} not found`); return; }
    if (r.checked_in_at) { toast.error(`${c} already checked in`); return; }
    if (r.status !== "confirmed") { toast.error(`Ticket ${c} is ${r.status}`); return; }
    const { error } = await supabase.from("rsvps").update({ checked_in_at: new Date().toISOString() }).eq("id", r.id);
    if (error) return toast.error(error.message);
    const { data: p } = await supabase.from("profiles").select("name, email, avatar_url").eq("id", r.user_id).maybeSingle();
    const enriched: Row = { ...(r as any), profile: p || undefined };
    setLast(enriched);
    toast.success(`✓ ${p?.name || p?.email || "Attendee"} checked in`);
    load();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await checkInCode(code);
    setCode("");
  };

  useEffect(() => {
    if (mode !== "scan") return;
    const elId = "qr-reader";
    const el = document.getElementById(elId);
    if (!el) return;
    const qr = new Html5Qrcode(elId, { verbose: false });
    scannerRef.current = qr;
    setScanning(true);
    qr.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
      (decoded) => {
        const now = Date.now();
        if (decoded === lastScanRef.current.code && now - lastScanRef.current.at < 2500) return;
        lastScanRef.current = { code: decoded, at: now };
        checkInCode(decoded);
      },
      () => {},
    ).catch((err) => {
      setScanning(false);
      toast.error("Camera unavailable. Switch to manual entry.");
      console.error(err);
    });
    return () => {
      const inst = scannerRef.current;
      scannerRef.current = null;
      setScanning(false);
      if (inst) inst.stop().then(() => inst.clear()).catch(() => {});
    };
  }, [mode, eventId]);

  const undo = async () => {
    if (!last) return;
    await supabase.from("rsvps").update({ checked_in_at: null }).eq("id", last.id);
    toast.success("Undone");
    setLast(null);
    load();
  };

  const exportCsv = () => {
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Name", "Email", "RSVP status", "Ticket code", "Check-in timestamp"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        r.profile?.name || "",
        r.profile?.email || "",
        r.checked_in_at ? "checked-in" : r.status,
        r.ticket_code,
        r.checked_in_at || "",
      ].map(esc).join(","));
    }
    const safe = (event?.title || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadFile(`${safe}-attendees.csv`, "\uFEFF" + lines.join("\n"), "text/csv;charset=utf-8");
  };

  if (!event) return <div className="container py-16 text-muted-foreground">Loading…</div>;

  const PersonRow = ({ r, badge }: { r: Row; badge?: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="h-9 w-9">
        <AvatarImage src={r.profile?.avatar_url || undefined} />
        <AvatarFallback>{initials(r.profile?.name, r.profile?.email)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{r.profile?.name || r.profile?.email || "Guest"}</div>
        <div className="text-xs text-muted-foreground font-mono">{r.ticket_code}</div>
      </div>
      {badge}
    </div>
  );

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Check-in</p>
          <h1 className="text-3xl font-extrabold">{event.title}</h1>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="h-4 w-4 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-soft p-5 text-center">
          <div className="text-4xl font-extrabold text-primary">{checkedIn.length}</div>
          <div className="text-sm text-muted-foreground">Checked in</div>
        </div>
        <div className="card-soft p-5 text-center">
          <div className="text-4xl font-extrabold">{remaining}</div>
          <div className="text-sm text-muted-foreground">Remaining</div>
        </div>
        <div className="card-soft p-5 text-center">
          <div className="text-4xl font-extrabold">{waitlist.length}</div>
          <div className="text-sm text-muted-foreground">Waitlist</div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <Button type="button" variant={mode === "scan" ? "default" : "outline"} className="flex-1" onClick={() => setMode("scan")}>
          <ScanLine className="h-4 w-4 mr-1.5" /> Scan QR
        </Button>
        <Button type="button" variant={mode === "manual" ? "default" : "outline"} className="flex-1" onClick={() => setMode("manual")}>
          <Keyboard className="h-4 w-4 mr-1.5" /> Manual code
        </Button>
      </div>

      <div className="card-elevated p-5 space-y-3 mb-6">
        {mode === "scan" ? (
          <>
            <div id="qr-reader" className="rounded-lg overflow-hidden bg-muted aspect-square w-full max-w-md mx-auto [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
            <p className="text-xs text-center text-muted-foreground">
              {scanning ? "Point camera at attendee's ticket QR code" : "Starting camera…"}
            </p>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-3 max-w-md mx-auto">
            <Input autoFocus className="text-center font-mono text-2xl tracking-widest h-14" placeholder="TICKET CODE"
              value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
            <Button type="submit" size="lg" className="w-full">Check in</Button>
          </form>
        )}

        {last && (
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={last.profile?.avatar_url || undefined} />
              <AvatarFallback>{initials(last.profile?.name, last.profile?.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-primary text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Checked in
              </div>
              <div className="font-bold truncate">{last.profile?.name || last.profile?.email || "Attendee"}</div>
              <div className="text-xs text-muted-foreground truncate">{event.title}</div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={undo}>
              <Undo2 className="h-4 w-4 mr-1.5" /> Undo
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-soft p-5">
          <h2 className="font-bold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Checked in ({checkedIn.length})
          </h2>
          {checkedIn.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No one checked in yet.</p>
          ) : (
            <div className="divide-y">
              {checkedIn.map(r => <PersonRow key={r.id} r={r} />)}
            </div>
          )}
        </div>
        <div className="card-soft p-5">
          <h2 className="font-bold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Waitlist ({waitlist.length})
          </h2>
          {waitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No one on the waitlist.</p>
          ) : (
            <div className="divide-y">
              {waitlist.map(r => <PersonRow key={r.id} r={r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
