import { useState } from "react";
import { Link as RLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus, ExternalLink, LogOut, Copy, Pencil, LinkIcon, Save, Upload } from "lucide-react";
import { useLinks, useProfile } from "@/hooks/useStore";
import { store, type LinkItem, type LayoutPreset, type BgKind } from "@/lib/store";
import { auth, type JwtPayload } from "@/lib/auth";
import { toast } from "sonner";

type Props = { session: JwtPayload };

const CATEGORIES: { value: LinkItem["category"]; label: string }[] = [
  { value: "social", label: "Social" },
  { value: "business", label: "Business / Recent" },
  { value: "spotlight", label: "Spotlight" },
];

export const AdminPanel = ({ session }: Props) => {
  const [profile, setProfile] = useProfile();
  const [links] = useLinks();
  const [draft, setDraft] = useState<{ label: string; url: string; category: LinkItem["category"] }>({ label: "", url: "", category: "business" });
  const [editing, setEditing] = useState<LinkItem | null>(null);

  const addLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.label.trim() || !draft.url.trim()) return;
    store.addLink({ label: draft.label.trim(), url: draft.url.trim(), category: draft.category });
    setDraft({ label: "", url: "", category: draft.category });
    toast.success("Link added");
  };

  const removeLink = (id: string) => {
    store.deleteLink(id);
    toast.success("Link deleted");
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!editing.label.trim() || !editing.url.trim()) {
      toast.error("Label and URL are required");
      return;
    }
    store.updateLink(editing.id, { label: editing.label.trim(), url: editing.url.trim(), category: editing.category });
    setEditing(null);
    toast.success("Link updated");
  };

  const copyShare = async () => {
    await navigator.clipboard.writeText(window.location.origin + "/");
    toast.success("Public link copied");
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });

  const handleAvatarFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image too large (max 2MB)"); return; }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfile({ ...profile, avatarUrl: dataUrl });
      toast.success("Logo uploaded");
    } catch { toast.error("Failed to read file"); }
  };

  const handleVideoFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Please choose a video file"); return; }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Video too large for local storage (max 4MB). Use a URL instead.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfile({ ...profile, bgVideoUrl: dataUrl, bgKind: "video" });
      toast.success("Background video uploaded");
    } catch { toast.error("Failed to read file"); }
  };

  return (
    <div className="min-h-screen bg-[hsl(16_90%_65%)] pb-12">
      {/* Header — same warm palette as the user panel */}
      <header className="sticky top-0 z-20 border-b-2 border-foreground bg-[hsl(16_90%_65%)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ring-2 ring-white/40">
              <LinkIcon className="h-5 w-5 text-[hsl(16_90%_55%)]" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white drop-shadow">Admin</p>
              <p className="text-xs text-white/90">Signed in as {session.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={copyShare} className="rounded-full">
              <Copy className="mr-2 h-4 w-4" />Share
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <RLink to="/"><ExternalLink className="mr-2 h-4 w-4" />View page</RLink>
            </Button>
            <Button size="sm" onClick={() => auth.logout()} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <LogOut className="mr-2 h-4 w-4" />Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Tabs defaultValue="links">
          <TabsList className="grid w-full grid-cols-3 rounded-full bg-white/85 p-1 shadow">
            <TabsTrigger value="links" className="rounded-full">Links</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full">Profile</TabsTrigger>
            <TabsTrigger value="theme" className="rounded-full">Customization</TabsTrigger>
          </TabsList>

          {/* LINKS */}
          <TabsContent value="links" className="mt-6 space-y-5">
            <Card className="rounded-3xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
              <CardHeader><CardTitle>Add a link</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={addLink} className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
                  <Input placeholder="Label (e.g. Instagram)" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} required />
                  <Input placeholder="https://..." value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} required type="url" />
                  <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v as LinkItem["category"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                    <Plus className="mr-2 h-4 w-4" />Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
              <CardHeader><CardTitle>Your links ({links.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {links.length === 0 && <p className="text-sm text-muted-foreground">No links yet. Add your first one above.</p>}
                {links.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{l.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize">{l.category}</span>
                      <Button variant="ghost" size="icon" onClick={() => setEditing({ ...l })} aria-label="Edit link">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeLink(l.id)} aria-label="Delete link">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile" className="mt-6">
            <Card className="rounded-3xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Handle</Label><Input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
                <div className="space-y-2"><Label>Display name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                <div className="space-y-2 md:col-span-2"><Label>Tagline</Label><Input value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} /></div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Avatar / logo</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Logo preview" className="h-full w-full object-cover" />
                      ) : (
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input value={profile.avatarUrl.startsWith("data:") ? "" : profile.avatarUrl} onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })} placeholder="https://... (image URL)" />
                      <div className="flex items-center gap-2">
                        <Button asChild type="button" variant="outline" size="sm" className="rounded-full">
                          <label className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />Upload image
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
                          </label>
                        </Button>
                        {profile.avatarUrl && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setProfile({ ...profile, avatarUrl: "" })}>
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><Label>Spotlight section title</Label><Input value={profile.spotlightLabel} onChange={(e) => setProfile({ ...profile, spotlightLabel: e.target.value })} /></div>
                <div className="space-y-2"><Label>Recent / business section title</Label><Input value={profile.recentLabel} onChange={(e) => setProfile({ ...profile, recentLabel: e.target.value })} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CUSTOMIZATION */}
          <TabsContent value="theme" className="mt-6 space-y-5">
            <Card className="rounded-3xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
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

            <Card className="rounded-3xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
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

            <Card className="rounded-3xl border-2 border-foreground shadow-[6px_6px_0_0_hsl(0_0%_10%)]">
              <CardHeader><CardTitle>Layout</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={profile.layout} onValueChange={(v) => setProfile({ ...profile, layout: v as LayoutPreset })} className="grid gap-3 md:grid-cols-3">
                  {([
                    ["stack-bordered", "Bordered stack", "Bold outline + drop shadow"],
                    ["soft-card", "Soft card", "Rounded card with soft shadow"],
                    ["outline-pill", "Outline pill", "Transparent pill with border"],
                  ] as const).map(([val, name, desc]) => (
                    <label key={val} htmlFor={`lay-${val}`} className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-3 hover:bg-accent/30">
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

      {/* Edit link dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Edit link</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="e-label">Label</Label>
                <Input id="e-label" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-url">URL</Label>
                <Input id="e-url" type="url" value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as LinkItem["category"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-foreground text-background hover:bg-foreground/90">
              <Save className="mr-2 h-4 w-4" />Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
