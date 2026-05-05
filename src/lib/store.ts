import { supabase } from "./supabase";

// LocalStorage-backed admin store for the Linktree-style app.
export type LinkItem = { id: string; label: string; url: string; category: "social" | "business" | "spotlight" };

export type LayoutPreset = "stack-bordered" | "soft-card" | "outline-pill";
export type BgKind = "color" | "video";

export type Profile = {
  username: string;        // display handle e.g. "@hubspot"
  name: string;            // display name
  tagline: string;         // small text under handle e.g. "#GrowBetter"
  avatarUrl: string;       // logo/avatar
  bgKind: BgKind;
  bgColor: string;         // hex
  bgVideoUrl: string;      // mp4 URL
  cardColor: string;       // hex - link card bg
  cardTextColor: string;   // hex
  textColor: string;       // hex - main text on background
  layout: LayoutPreset;
  spotlightLabel: string;  // e.g. "Spotlight 💡"
  recentLabel: string;     // e.g. "Recent Posts"
};

const KEYS = {
  profile: "lt_profile",
  links: "lt_links",
};

const defaultLinks: LinkItem[] = [];

const defaultProfile: Profile = {
  username: "@username",
  name: "My Page",
  tagline: "Welcome to my page",
  avatarUrl: "",
  bgKind: "color",
  bgColor: "#FF7A59",
  bgVideoUrl: "",
  cardColor: "#FFFFFF",
  cardTextColor: "#111111",
  textColor: "#111111",
  layout: "stack-bordered",
  spotlightLabel: "Spotlight 💡",
  recentLabel: "My Links",
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("lt:update"));
}

const isSupabaseConfigured = () => {
  return !!supabase;
};

export const store = {
  // --- Cached (Sync) access for initial render ---
  getCachedProfile(): Profile {
    return { ...defaultProfile, ...readLocal<Partial<Profile>>(KEYS.profile, {}) };
  },
  getCachedLinks(): LinkItem[] {
    return readLocal<LinkItem[]>(KEYS.links, defaultLinks);
  },

  // --- Async access (DB + Local Update) ---
  async getProfile(): Promise<Profile> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!.from('config').select('value').eq('key', 'profile').single();
      if (error) {
        console.error("Supabase getProfile error:", error.message);
      } else if (data) {
        const profile = { ...defaultProfile, ...data.value };
        writeLocal(KEYS.profile, profile);
        return profile;
      }
    }
    return this.getCachedProfile();
  },

  async saveProfile(p: Profile) {
    writeLocal(KEYS.profile, p);
    if (isSupabaseConfigured()) {
      const { error } = await supabase!.from('config').upsert({ key: 'profile', value: p }, { onConflict: 'key' });
      if (error) console.error("Supabase saveProfile error:", error.message);
    }
  },

  async getLinks(): Promise<LinkItem[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!.from('config').select('value').eq('key', 'links').single();
      if (error) {
        console.error("Supabase getLinks error:", error.message);
      } else if (data) {
        const links = data.value as LinkItem[];
        writeLocal(KEYS.links, links);
        return links;
      }
    }
    return this.getCachedLinks();
  },

  async saveLinks(links: LinkItem[]) {
    writeLocal(KEYS.links, links);
    if (isSupabaseConfigured()) {
      const { error } = await supabase!.from('config').upsert({ key: 'links', value: links }, { onConflict: 'key' });
      if (error) console.error("Supabase saveLinks error:", error.message);
    }
  },

  async addLink(input: Omit<LinkItem, "id">) {
    const links = await this.getLinks();
    const next: LinkItem = { id: crypto.randomUUID(), ...input };
    await this.saveLinks([...links, next]);
    return next;
  },

  async updateLink(id: string, patch: Partial<Omit<LinkItem, "id">>) {
    const links = await this.getLinks();
    await this.saveLinks(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  },

  async deleteLink(id: string) {
    const links = await this.getLinks();
    await this.saveLinks(links.filter((l) => l.id !== id));
  },
};

export const SOCIAL_ICONS: Record<string, string> = {
  instagram: "instagram", youtube: "youtube", linkedin: "linkedin", x: "twitter", twitter: "twitter",
  tiktok: "music-2", facebook: "facebook", github: "github", twitch: "twitch",
};
