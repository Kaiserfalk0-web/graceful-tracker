import { useLocalStorage } from "./useLocalStorage";
import { useChurchProfile } from "./useChurchProfile";
import { useCallback } from "react";

export interface ActivityEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: "member" | "service" | "finance" | "report" | "profile";
  detail?: string;
}

export function useActivityLog() {
  const [log, setLog] = useLocalStorage<ActivityEntry[]>("gracetrack_activity_log", []);
  const { profile } = useChurchProfile();

  const addEntry = useCallback(
    (action: string, category: ActivityEntry["category"], detail?: string) => {
      const entry: ActivityEntry = {
        id: crypto.randomUUID?.() ?? Date.now().toString(36),
        timestamp: new Date().toISOString(),
        user: profile.pastorName || "Admin",
        action,
        category,
        detail,
      };
      setLog((prev) => [entry, ...prev].slice(0, 200));
    },
    [profile.pastorName, setLog]
  );

  return { log, addEntry };
}
