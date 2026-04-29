import { useEffect, useState } from "react";
import { store, type Profile, type LinkItem } from "@/lib/store";
import { auth, type JwtPayload } from "@/lib/auth";

export function useProfile(): [Profile, (p: Profile) => void] {
  const [p, setP] = useState<Profile>(() => store.getProfile());
  useEffect(() => {
    const sync = () => setP(store.getProfile());
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("lt:update", sync); window.removeEventListener("storage", sync); };
  }, []);
  return [p, (next) => store.saveProfile(next)];
}

export function useLinks(): [LinkItem[], (l: LinkItem[]) => void] {
  const [l, setL] = useState<LinkItem[]>(() => store.getLinks());
  useEffect(() => {
    const sync = () => setL(store.getLinks());
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("lt:update", sync); window.removeEventListener("storage", sync); };
  }, []);
  return [l, (next) => store.saveLinks(next)];
}

export function useSession(): { session: JwtPayload | null; loading: boolean } {
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const sync = async () => {
      const s = await auth.getSession();
      if (alive) { setSession(s); setLoading(false); }
    };
    sync();
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    return () => { alive = false; window.removeEventListener("lt:update", sync); window.removeEventListener("storage", sync); };
  }, []);
  return { session, loading };
}

