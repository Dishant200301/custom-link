import { useState } from "react";
import { Link as RLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { toast } from "sonner";
import { LinkIcon, ArrowLeft, Loader2 } from "lucide-react";

export const AdminAuth = () => {
  const hasAccount = auth.hasAccount();
  const [tab, setTab] = useState<"login" | "signup">(hasAccount ? "login" : "signup");
  const [identifier, setIdentifier] = useState(""); // email or username on login
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signup") {
        await auth.signup({ username, email, password });
        toast.success("Account created — you're signed in");
      } else {
        await auth.login(identifier, password);
        toast.success("Welcome back");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[hsl(16_90%_65%)]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10 text-foreground">
        <RLink to="/" className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-foreground shadow hover:bg-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Public page
        </RLink>

        {/* Avatar-style logo to mirror the user panel */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white/40">
          <LinkIcon className="h-9 w-9 text-[hsl(16_90%_55%)]" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-white drop-shadow">Admin</h1>
        <p className="mt-1 text-sm text-white/90">
          {hasAccount ? "Log in to manage your page" : "Create your admin account"}
        </p>

        <div className="mt-6 w-full rounded-3xl border-2 border-foreground bg-white p-5 shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
              <TabsTrigger value="login" disabled={!hasAccount && tab !== "login"} className="rounded-full">Login</TabsTrigger>
              <TabsTrigger value="signup" disabled={hasAccount} className="rounded-full">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Email or username</Label>
                  <Input id="id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lp">Password</Label>
                  <Input id="lp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={busy} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su">Username</Label>
                  <Input id="su" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} autoComplete="username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="se">Email</Label>
                  <Input id="se" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp">Password</Label>
                  <Input id="sp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
                </div>
                <Button type="submit" disabled={busy} className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90">
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-4 text-center text-xs text-white/80">
          Sessions are signed with JWT (HS256) and stored locally.
        </p>
      </main>
    </div>
  );
};

export default AdminAuth;
