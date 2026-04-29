import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { store } from "@/lib/store";
import { toast } from "sonner";

export const AdminAuth = () => {
  const hasAccount = !!store.getUser();
  const [tab, setTab] = useState(hasAccount ? "login" : "signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (tab === "signup") { store.signup(username, password); toast.success("Admin account created"); }
      else { store.login(username, password); toast.success("Welcome back"); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin panel</CardTitle>
          <CardDescription>
            {hasAccount ? "Log in to manage your page." : "Create the admin account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" disabled={!hasAccount}>Login</TabsTrigger>
              <TabsTrigger value="signup" disabled={hasAccount}>Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="u">Username</Label>
                  <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p">Password</Label>
                  <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full">{tab === "signup" ? "Create account" : "Log in"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
