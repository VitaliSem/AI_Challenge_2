import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Flag, ImagePlus } from "lucide-react";
import { toast } from "sonner";

export default function GallerySection({ eventId, hostId, past }: { eventId: string; hostId: string; past: boolean }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("gallery_photos").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
    setPhotos(data || []);
  };
  useEffect(() => { load(); }, [eventId]);

  const upload = async (f: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${eventId}/${user.id}-${Date.now()}-${f.name}`;
    const { error: ue } = await supabase.storage.from("gallery").upload(path, f);
    if (ue) { setUploading(false); return toast.error(ue.message); }
    const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
    const { error } = await supabase.from("gallery_photos").insert({
      event_id: eventId, user_id: user.id, url: pub.publicUrl, status: "pending",
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded! Pending host approval.");
    load();
  };

  const report = async (pid: string) => {
    if (!user) return;
    await supabase.from("reports").insert({
      target_type: "gallery_photo", target_id: pid, reporter_id: user.id, host_id: hostId,
    });
    toast.success("Reported — thanks");
  };

  const visible = photos.filter(p => p.status === "approved" || p.user_id === user?.id);

  if (!past && visible.length === 0) return null;

  return (
    <div className="card-soft p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gallery</h2>
        {past && user && (
          <>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <ImagePlus className="h-4 w-4 mr-1.5" /> {uploading ? "Uploading…" : "Add photo"}
            </Button>
          </>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="text-muted-foreground text-sm">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {visible.map(p => (
            <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              {p.status === "pending" && <span className="absolute top-2 left-2 bg-warning text-warning-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Pending</span>}
              {user && p.user_id !== user.id && (
                <button onClick={() => report(p.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-background/80 rounded-full p-1.5">
                  <Flag className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}