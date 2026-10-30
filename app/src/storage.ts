import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Entry } from "./types";

// Entries are saved as they change, so a crash or Android killing the app in
// the background doesn't wipe the running total. Only counts are stored —
// never photos.
const KEY = "chicken-counter:entries:v1";

export async function loadEntries(): Promise<Entry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: Entry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // Best effort: failing to save must never block counting.
  }
}
