import { useEffect, useState } from "react";
import { store, type Profile, type LinkItem } from "@/lib/store";
import { auth, type JwtPayload } from "@/lib/auth";

export function useProfile(): { profile: Profile; setProfile: (p: Profile) => Promise<void>; loading: boolean } {
  const [profile, setProfileState] = useState<Profile>(() => store.getCachedProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await store.getProfile();
      setProfileState(data);
      setLoading(false);
    };
    load();

    const sync = () => {
      setProfileState(store.getCachedProfile());
    };
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("lt:update", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", load);
    };
  }, []);

  const setProfile = async (next: Profile) => {
    setProfileState(next); // Update local state immediately
    await store.saveProfile(next); // Sync to store/DB
  };

  return { profile, setProfile, loading };
}

export function useLinks(): { links: LinkItem[]; setLinks: (l: LinkItem[]) => Promise<void>; loading: boolean } {
  const [links, setLinksState] = useState<LinkItem[]>(() => store.getCachedLinks());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await store.getLinks();
      setLinksState(data);
      setLoading(false);
    };
    load();

    const sync = () => {
      setLinksState(store.getCachedLinks());
    };
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("lt:update", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", load);
    };
  }, []);

  const setLinks = async (next: LinkItem[]) => {
    setLinksState(next); // Update local state immediately
    await store.saveLinks(next); // Sync to store/DB
  };

  return { links, setLinks, loading };
}

export function useSession(): { session: JwtPayload | null; loading: boolean } {
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const sync = async () => {
      const s = await auth.getSession();
      if (alive) {
        setSession(s);
        setLoading(false);
      }
    };
    sync();
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    return () => {
      alive = false;
      window.removeEventListener("lt:update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { session, loading };
}
