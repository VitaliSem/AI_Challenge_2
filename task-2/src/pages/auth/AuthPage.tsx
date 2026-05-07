import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CalendarHeart } from "lucide-react";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get("next") || "/";
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate(next, { replace: true });
  };

  const signUp = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}${next}`,
      },
    });
    setBusy(false);
    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        return toast.error("An account with this email already exists. Please sign in instead.");
      }
      return toast.error(error.message);
    }
    // When email confirmation is on, Supabase returns an empty identities array for duplicate emails
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return toast.error("An account with this email already exists. Please sign in instead.");
    }
    toast.success("Account created — you're signed in!");
    navigate(next, { replace: true });
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md card-elevated p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="grid place-items-center h-12 w-12 rounded-full bg-primary text-primary-foreground mb-3">
            <CalendarHeart className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Gather</h1>
          <p className="text-muted-foreground text-sm mt-1">Free community events, big and small.</p>
        </div>
        <Tabs defaultValue={initialMode}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={busy} onClick={signIn}>Sign in</Button>
          </TabsContent>
          <TabsContent value="signup" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground bg-primary-soft/50 border border-primary/20 rounded-md p-3">
              📧 After creating your account, please check your email inbox to verify your address before signing in.
            </p>
            <div className="space-y-2">
              <Label>Your name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" disabled={busy} onClick={signUp}>Create account</Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}