import React from "react";
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
} from "react-native";
import { TabBarIcon } from "../../app/(tabs)/_layout";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  const theme = useColorScheme();
  const isDark = theme === "dark";

  const getModalStyle = () => {
    const baseStyle = {
      backgroundColor: isDark ? "#000" : "#ffffff",
      borderWidth: 2,
      borderColor: isDark ? "#374151" : "#e5e7eb",
      borderRadius: 16,
      maxHeight: "90%",
    };

    switch (size) {
      case "sm":
        return { ...baseStyle, width: "80%" };
      case "md":
        return { ...baseStyle, width: "90%" };
      case "lg":
        return { ...baseStyle, width: "95%" };
      case "full":
        return {
          ...baseStyle,
          width: "100%",
          height: "100%",
          borderRadius: 0,
          maxHeight: "100%",
        };
      default:
        return { ...baseStyle, width: "90%" };
    }
  };

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[getModalStyle(), styles.modal]}>
          {showCloseButton && (
            <View style={styles.closeButtonContainer}>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <TabBarIcon
                  name="times"
                  color={isDark ? "#ffffff" : "#374151"}
                  size={24}
                />
              </Pressable>
            </View>
          )}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    position: "relative",
  },
  closeButtonContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  content: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
