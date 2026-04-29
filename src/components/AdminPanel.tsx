import { useState } from "react";
import { Link as RLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, ExternalLink, LogOut, Copy } from "lucide-react";
import { useLinks, useProfile } from "@/hooks/useStore";
import { store, type LinkItem, type LayoutPreset, type BgKind } from "@/lib/store";
import { toast } from "sonner";

export const AdminPanel = () => {
  const [profile, setProfile] = useProfile();
  const [links, setLinks] = useLinks();
  const [draft, setDraft] = useState<{ label: string; url: string; category: LinkItem["category"] }>({ label: "", url: "", category: "business" });

  const addLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.label.trim() || !draft.url.trim()) return;
    const next: LinkItem = { id: crypto.randomUUID(), label: draft.label.trim(), url: draft.url.trim(), category: draft.category };
    setLinks([...links, next]);
    setDraft({ label: "", url: "", category: draft.category });
    toast.success("Link added");
  };

  const removeLink = (id: string) => setLinks(links.filter((l) => l.id !== id));

  const copyShare = async () => {
    await navigator.clipboard.writeText(window.location.origin + "/");
    toast.success("Public link copied");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Admin panel</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyShare}><Copy className="mr-2 h-4 w-4" />Share link</Button>
            <Button asChild variant="outline" size="sm"><RLink to="/"><ExternalLink className="mr-2 h-4 w-4" />View page</RLink></Button>
            <Button variant="ghost" size="sm" onClick={() => store.logout()}><LogOut className="mr-2 h-4 w-4" />Log out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Tabs defaultValue="links">
          <TabsList>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="theme">Customization</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle>Add a link</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={addLink} className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
                  <Input placeholder="Label (e.g. Instagram)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} required />
                  <Input placeholder="https://..." value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} required type="url" />
                  <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as LinkItem["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="business">Business / Recent</SelectItem>
                      <SelectItem value="spotlight">Spotlight</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit"><Plus className="mr-2 h-4 w-4" />Add</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Your links</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {links.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
                {links.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.url}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{l.category}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeLink(l.id)} aria-label="Delete link">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Handle</Label><Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
                <div className="space-y-2"><Label>Display name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Tagline</Label><Input value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Avatar / logo URL</Label><Input value={profile.avatarUrl} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} placeholder="https://..." /></div>
                <div className="space-y-2"><Label>Spotlight section title</Label><Input value={profile.spotlightLabel} onChange={(e) => setProfile({ ...profile, spotlightLabel: e.target.value })} /></div>
                <div className="space-y-2"><Label>Recent / business section title</Label><Input value={profile.recentLabel} onChange={(e) => setProfile({ ...profile, recentLabel: e.target.value })} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="mt-4 space-y-4">
            <Card>
              <CardHeader><CardTitle>Background</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={profile.bgKind} onValueChange={(v) => setProfile({ ...profile, bgKind: v as BgKind })} className="flex gap-6">
                  <div className="flex items-center gap-2"><RadioGroupItem id="bg-color" value="color" /><Label htmlFor="bg-color">Color</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem id="bg-video" value="video" /><Label htmlFor="bg-video">Video</Label></div>
                </RadioGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Background color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={profile.bgColor} onChange={(e) => setProfile({ ...profile, bgColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border" />
                      <Input value={profile.bgColor} onChange={(e) => setProfile({ ...profile, bgColor: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background video URL (mp4)</Label>
                    <Input value={profile.bgVideoUrl} onChange={(e) => setProfile({ ...profile, bgVideoUrl: e.target.value })} placeholder="https://.../video.mp4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Theme colors</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {([["textColor","Main text"],["cardColor","Link card"],["cardTextColor","Link text"]] as const).map(([k, label]) => (
                  <div className="space-y-2" key={k}>
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} className="h-10 w-14 cursor-pointer rounded border" />
                      <Input value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Layout</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={profile.layout} onValueChange={(v) => setProfile({ ...profile, layout: v as LayoutPreset })} className="grid gap-3 md:grid-cols-3">
                  {([
                    ["stack-bordered", "Bordered stack", "Bold outline + drop shadow"],
                    ["soft-card", "Soft card", "Rounded card with soft shadow"],
                    ["outline-pill", "Outline pill", "Transparent pill with border"],
                  ] as const).map(([val, name, desc]) => (
                    <label key={val} htmlFor={`lay-${val}`} className="flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 hover:bg-accent/30">
                      <RadioGroupItem id={`lay-${val}`} value={val} className="mt-1" />
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
