import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export async function getStorageUsageBytes(prefix?: string | RegExp) {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const filteredKeys = prefix
      ? keys.filter((k) =>
          typeof prefix === "string" ? k.startsWith(prefix) : prefix.test(k)
        )
      : keys;

    const pairs = await AsyncStorage.multiGet(filteredKeys);
    let bytes = 0;
    for (const [, value] of pairs) {
      if (typeof value === "string") {
        // Approx: 1 char ~ 1 byte in storage engines (varie selon moteur)
        bytes += value.length;
      }
    }
    return { bytes, keys: filteredKeys };
  } catch (e) {
    return { bytes: 0, keys: [] as string[] };
  }
}

export function getEstimatedStorageLimitBytes(): number {
  // Web localStorage ~5 Mo par origine (approx)
  if (Platform.OS === "web") return 5 * 1024 * 1024;
  // Natif (AsyncStorage basé sur SQLite/fichiers) : pas de limite stricte documentée.
  // On retourne un plafond "soft" raisonnable pour l'alerte.
  return 55 * 1024 * 1024;
}
