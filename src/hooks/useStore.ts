import { useEffect, useState } from "react";
import { store, type Profile, type LinkItem } from "@/lib/store";

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

export function useAuth() {
  const [authed, setAuthed] = useState<boolean>(() => store.isAuthed());
  useEffect(() => {
    const sync = () => setAuthed(store.isAuthed());
    window.addEventListener("lt:update", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("lt:update", sync); window.removeEventListener("storage", sync); };
  }, []);
  return authed;
}
