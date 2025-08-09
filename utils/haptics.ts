// Haptics optionnels via expo-haptics. No-op si le module est absent.
let ExpoHaptics: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ExpoHaptics = require("expo-haptics");
} catch (e) {
  ExpoHaptics = null;
}

export async function triggerSuccess(): Promise<void> {
  if (!ExpoHaptics) return;
  try {
    await ExpoHaptics.notificationAsync(
      ExpoHaptics.NotificationFeedbackType.Success
    );
  } catch (e) {
    // silencieux
  }
}

export async function triggerImpactLight(): Promise<void> {
  if (!ExpoHaptics) return;
  try {
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // silencieux
  }
}
