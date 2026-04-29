import { useEffect, useMemo } from "react";
import { Instagram, Youtube, Linkedin, Twitter, Music2, Facebook, Github, Twitch, Link as LinkIcon, User } from "lucide-react";
import { useLinks, useProfile } from "@/hooks/useStore";
import { hexToHsl } from "@/lib/color";
import type { LayoutPreset } from "@/lib/store";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram, youtube: Youtube, linkedin: Linkedin, x: Twitter, twitter: Twitter,
  tiktok: Music2, facebook: Facebook, github: Github, twitch: Twitch,
};

function iconFor(label: string) {
  const key = label.trim().toLowerCase();
  return ICONS[key] ?? LinkIcon;
}

function layoutClass(layout: LayoutPreset) {
  switch (layout) {
    case "soft-card": return "lt-link-soft";
    case "outline-pill": return "lt-link-pill";
    default: return "lt-link-card";
  }
}

export const UserPanel = () => {
  const [profile] = useProfile();
  const [links] = useLinks();

  // Apply theme tokens scoped to the panel via CSS variables on body.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--lt-bg", hexToHsl(profile.bgColor));
    root.style.setProperty("--lt-text", hexToHsl(profile.textColor));
    root.style.setProperty("--lt-card", hexToHsl(profile.cardColor));
    root.style.setProperty("--lt-card-text", hexToHsl(profile.cardTextColor));
  }, [profile]);

  const social = useMemo(() => links.filter((l) => l.category === "social"), [links]);
  const spotlight = useMemo(() => links.filter((l) => l.category === "spotlight"), [links]);
  const business = useMemo(() => links.filter((l) => l.category === "business"), [links]);
  const linkClass = layoutClass(profile.layout);

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ backgroundColor: profile.bgKind === "color" ? profile.bgColor : "#000" }}>
      {profile.bgKind === "video" && profile.bgVideoUrl && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={profile.bgVideoUrl}
          autoPlay loop muted playsInline
        />
      )}
      {profile.bgKind === "video" && <div className="absolute inset-0 bg-black/30" />}

      <main className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center px-6 py-10" style={{ color: profile.textColor }}>
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white/40 overflow-hidden">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${profile.name} logo`} className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-foreground/70" />
          )}
        </div>

        {/* Handle + tagline */}
        <h1 className="mt-4 text-xl font-bold">{profile.username}</h1>
        {profile.tagline && <p className="mt-1 text-sm opacity-90">{profile.tagline}</p>}

        {/* Social row */}
        {social.length > 0 && (
          <nav aria-label="Social media" className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {social.map((s) => {
              const Icon = iconFor(s.label);
              return (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}
                   className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                   style={{ color: profile.textColor }}>
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </nav>
        )}

        {/* Spotlight */}
        {spotlight.length > 0 && (
          <section className="mt-8 w-full">
            <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide opacity-90">
              {profile.spotlightLabel}
            </h2>
            <div className="flex flex-col gap-3">
              {spotlight.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className={linkClass}>
                  {l.label}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Business / Recent */}
        {business.length > 0 && (
          <section className="mt-6 w-full pb-12">
            <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide opacity-90">
              {profile.recentLabel}
            </h2>
            <div className="flex flex-col gap-3">
              {business.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className={linkClass}>
                  {l.label}
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default UserPanel;
