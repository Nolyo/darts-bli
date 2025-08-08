import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  fullScreen = false,
}) => {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const containerStyle = fullScreen
    ? styles.fullScreenContainer
    : styles.container;

  const color = isDark ? '#ffffff' : '#374151';

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, { color }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});