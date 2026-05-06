import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/format";
import { toast } from "sonner";

export default function BecomeHost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [contact, setContact] = useState(user?.email || "");
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !name) return;
    setBusy(true);
    let logo_url: string | null = null;
    if (logo) {
      const path = `${user.id}/${Date.now()}-${logo.name}`;
      const { error: ue } = await supabase.storage.from("host-logos").upload(path, logo);
      if (!ue) logo_url = supabase.storage.from("host-logos").getPublicUrl(path).data.publicUrl;
    }
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase.from("hosts").insert({
      name, bio, contact_email: contact, slug, owner_id: user.id, logo_url,
    }).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("You're a host! 🎉");
    navigate(`/host/${data.id}/dashboard`);
  };

  return (
    <div className="container max-w-xl py-10">
      <h1 className="text-3xl font-extrabold mb-2">Become a host</h1>
      <p className="text-muted-foreground mb-6">Set up your community profile to start hosting events.</p>
      <div className="card-elevated p-6 space-y-4">
        <div className="space-y-2">
          <Label>Host name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Brooklyn Book Club" />
        </div>
        <div className="space-y-2">
          <Label>Short bio</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people what you're about" />
        </div>
        <div className="space-y-2">
          <Label>Contact email</Label>
          <Input type="email" value={contact} onChange={e => setContact(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Logo</Label>
          <Input type="file" accept="image/*" onChange={e => setLogo(e.target.files?.[0] || null)} />
        </div>
        <Button className="w-full" disabled={busy || !name} onClick={submit}>Create host profile</Button>
      </div>
    </div>
  );
}