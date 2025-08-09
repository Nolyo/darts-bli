import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Updates from "expo-updates";
import { Modal } from "./ui/Modal";
import { Title, Text, View } from "./Themed";
import { Button } from "./ui/Button";

/**
 * Vérifie les updates OTA au démarrage.
 * - Télécharge en arrière-plan si dispo
 * - Propose de redémarrer pour appliquer
 * - Skip en développement et sur le web
 */
export const UpdatesChecker: React.FC = () => {
  const [updateReady, setUpdateReady] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    // Pas d'updates en dev, ni sur web
    if (__DEV__ || Platform.OS === "web") return;

    let cancelled = false;
    (async () => {
      try {
        if (!Updates.isEnabled) return;
        setChecking(true);
        const result = await Updates.checkForUpdateAsync();
        if (cancelled) return;
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          if (cancelled) return;
          setUpdateReady(true);
        }
      } catch {
        // silencieux
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Modal
      visible={updateReady}
      onClose={() => setUpdateReady(false)}
      size="sm"
    >
      <Title style={{ alignSelf: "center", marginBottom: 12 }}>
        Mise à jour disponible
      </Title>
      <Text style={{ textAlign: "center", marginBottom: 16 }}>
        Une nouvelle version a été téléchargée.
        {"\n"}Redémarrer maintenant pour l'appliquer ?
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button
          title="Plus tard"
          onPress={() => setUpdateReady(false)}
          variant="outline"
          size="md"
          style={{ flex: 1 }}
        />
        <Button
          title="Redémarrer"
          onPress={async () => {
            try {
              await Updates.reloadAsync();
            } catch {
              setUpdateReady(false);
            }
          }}
          variant="primary"
          size="md"
          style={{ flex: 1 }}
        />
      </View>
    </Modal>
  );
};

export default UpdatesChecker;
