// Lecture optionnelle de sons via expo-av, si disponible.
// Si expo-av n'est pas installé, les fonctions sont no-op.

import { Platform } from "react-native";
import { useGameStore } from "../stores/gameStore";

let ExpoAudio: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ExpoAudio = require("expo-av").Audio;
} catch (e) {
  ExpoAudio = null;
}

const DEFAULT_VICTORY_URL =
  "https://assets.mixkit.co/sfx/preview/mixkit-game-level-completed-2059.mp3";

export async function playVictorySound(url: string = DEFAULT_VICTORY_URL) {
  // Respect du réglage utilisateur
  try {
    const soundsEnabled = (useGameStore.getState() as any).soundsEnabled;
    if (!soundsEnabled) return;
  } catch (e) {
    // en cas d'accès store impossible, on continue silencieusement
  }
  // Web: fallback HTML5 Audio (meilleure compatibilité en dev navigateur)
  if (Platform.OS === "web") {
    try {
      const audio = new Audio(url);
      audio.volume = 0.7;
      await audio.play();
    } catch (e) {
      // ignore
    }
    return;
  }

  if (!ExpoAudio) return; // no-op si expo-av absent
  try {
    await ExpoAudio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const soundObj = await ExpoAudio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: 0.8 }
    );
    const sound = soundObj.sound;
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (e) {
    // silencieux
  }
}
