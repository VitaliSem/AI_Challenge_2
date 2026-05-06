import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InviteAccept() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<any>(null);
  const [host, setHost] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("host_invites").select("*, hosts(*)").eq("token", token!).maybeSingle();
      setInvite(data);
      setHost(data?.hosts);
    })();
  }, [token]);

  const accept = async () => {
    if (!user) { navigate(`/auth?next=/invite/${token}`); return; }
    const { error } = await supabase.from("host_members").insert({
      host_id: invite.host_id, user_id: user.id, role: invite.role,
    });
    if (error && !error.message.includes("duplicate")) return toast.error(error.message);
    toast.success(`You joined ${host.name} as ${invite.role}!`);
    navigate(invite.role === "host" ? `/host/${invite.host_id}/dashboard` : "/my-events");
  };

  if (!invite) return <div className="container py-16 text-muted-foreground">Loading…</div>;

  return (
    <div className="container max-w-md py-16">
      <div className="card-elevated p-8 text-center space-y-4">
        <h1 className="text-2xl font-extrabold">Join {host?.name}</h1>
        <p className="text-muted-foreground">You've been invited as a <strong>{invite.role}</strong>.</p>
        <Button className="w-full" size="lg" onClick={accept}>Accept invite</Button>
      </div>
    </div>
  );
}