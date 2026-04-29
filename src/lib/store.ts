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

const defaultLinks: LinkItem[] = [
  { id: crypto.randomUUID(), label: "HubSpot Spotlight", url: "https://hubspot.com", category: "spotlight" },
  { id: crypto.randomUUID(), label: "Check out what's new with HubSpot", url: "https://hubspot.com/new", category: "business" },
  { id: crypto.randomUUID(), label: "The 2023 Global Unicorn Report", url: "https://hubspot.com/unicorn", category: "business" },
  { id: crypto.randomUUID(), label: "Marketing Sales Leader Top 25 — Winners!", url: "https://hubspot.com/top25", category: "business" },
  { id: crypto.randomUUID(), label: "Out of Office Email Generator", url: "https://hubspot.com/ooo", category: "business" },
  { id: crypto.randomUUID(), label: "Content Assistant now in Public Beta", url: "https://hubspot.com/ai", category: "business" },
  { id: crypto.randomUUID(), label: "Instagram", url: "https://instagram.com/hubspot", category: "social" },
  { id: crypto.randomUUID(), label: "YouTube", url: "https://youtube.com/hubspot", category: "social" },
  { id: crypto.randomUUID(), label: "LinkedIn", url: "https://linkedin.com/company/hubspot", category: "social" },
  { id: crypto.randomUUID(), label: "X", url: "https://x.com/hubspot", category: "social" },
  { id: crypto.randomUUID(), label: "TikTok", url: "https://tiktok.com/@hubspot", category: "social" },
];

const defaultProfile: Profile = {
  username: "@hubspot",
  name: "HubSpot",
  tagline: "#GrowBetter",
  avatarUrl: "",
  bgKind: "color",
  bgColor: "#FF7A59",
  bgVideoUrl: "",
  cardColor: "#FFFFFF",
  cardTextColor: "#111111",
  textColor: "#111111",
  layout: "stack-bordered",
  spotlightLabel: "Spotlight 💡",
  recentLabel: "Recent Posts",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("lt:update")); }

export const store = {
  getProfile(): Profile { return { ...defaultProfile, ...read<Partial<Profile>>(KEYS.profile, {}) }; },
  saveProfile(p: Profile) { write(KEYS.profile, p); },

  getLinks(): LinkItem[] {
    const raw = localStorage.getItem(KEYS.links);
    if (!raw) { write(KEYS.links, defaultLinks); return defaultLinks; }
    try { return JSON.parse(raw) as LinkItem[]; } catch { return defaultLinks; }
  },
  saveLinks(links: LinkItem[]) { write(KEYS.links, links); },

  addLink(input: Omit<LinkItem, "id">) {
    const next: LinkItem = { id: crypto.randomUUID(), ...input };
    this.saveLinks([...this.getLinks(), next]);
    return next;
  },
  updateLink(id: string, patch: Partial<Omit<LinkItem, "id">>) {
    this.saveLinks(this.getLinks().map((l) => (l.id === id ? { ...l, ...patch } : l)));
  },
  deleteLink(id: string) { this.saveLinks(this.getLinks().filter((l) => l.id !== id)); },
};

export const SOCIAL_ICONS: Record<string, string> = {
  instagram: "instagram", youtube: "youtube", linkedin: "linkedin", x: "twitter", twitter: "twitter",
  tiktok: "music-2", facebook: "facebook", github: "github", twitch: "twitch",
};
