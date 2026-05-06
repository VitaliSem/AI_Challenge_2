import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

export default function HostTeam() {
  const { hostId } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [role, setRole] = useState<"host" | "checker">("checker");

  const load = async () => {
    const { data: m } = await supabase.from("host_members")
      .select("*, profiles:user_id(name, email)").eq("host_id", hostId!);
    setMembers(m || []);
    const { data: inv } = await supabase.from("host_invites").select("*").eq("host_id", hostId!).order("created_at", { ascending: false });
    setInvites(inv || []);
  };
  useEffect(() => { load(); }, [hostId]);

  const createInvite = async () => {
    const { error } = await supabase.from("host_invites").insert({ host_id: hostId!, role });
    if (error) return toast.error(error.message);
    toast.success("Invite link created");
    load();
  };

  const inviteUrl = (token: string) => `${window.location.origin}/invite/${token}`;

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold mb-6">Team & invites</h1>

      <div className="card-elevated p-5 mb-6">
        <h2 className="font-bold mb-3">Create invite link</h2>
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={v => setRole(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checker">Checker — check-in only</SelectItem>
                <SelectItem value="host">Host — full access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={createInvite}>Create link</Button>
        </div>
      </div>

      <div className="card-soft p-5 mb-6">
        <h2 className="font-bold mb-3">Active invites</h2>
        {invites.length === 0 ? <p className="text-sm text-muted-foreground">No invite links.</p> : invites.map(i => (
          <div key={i.id} className="flex items-center gap-2 py-2 border-b last:border-0">
            <span className="text-xs font-bold uppercase bg-secondary px-2 py-0.5 rounded">{i.role}</span>
            <Input readOnly value={inviteUrl(i.token)} className="font-mono text-xs" />
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(inviteUrl(i.token)); toast.success("Copied"); }}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("host_invites").delete().eq("id", i.id); load(); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="card-soft p-5">
        <h2 className="font-bold mb-3">Members</h2>
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 py-2 border-b last:border-0">
            <div className="flex-1">
              <div className="font-semibold">{m.profiles?.name || m.profiles?.email}</div>
              <div className="text-xs text-muted-foreground">{m.profiles?.email}</div>
            </div>
            <span className="text-xs font-bold uppercase bg-secondary px-2 py-0.5 rounded">{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}