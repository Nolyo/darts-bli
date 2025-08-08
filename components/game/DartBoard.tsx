import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Button } from '../ui/Button';

interface DartBoardProps {
  onDartPress: (score: number) => void;
  disabled?: boolean;
}

export const DartBoard: React.FC<DartBoardProps> = ({
  onDartPress,
  disabled = false,
}) => {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const standardNumbers = Array.from(Array(21).keys()); // 0-20
  const specialScores = [25, 50]; // Bull, Double Bull

  const getDartColor = (score: number): string => {
    if (score === 0) return '#ef4444'; // Red for miss
    if (score === 25 || score === 50) return '#3b82f6'; // Blue for bull
    if (score % 2 === 0) return '#f59e0b'; // Orange for even numbers
    return '#10b981'; // Green for odd numbers
  };

  const renderDartButton = (score: number) => {
    const isSpecial = score === 0 || score === 25 || score === 50;
    const buttonText = score === 50 ? 'Bull' : score.toString();
    
    return (
      <Button
        key={score}
        title={buttonText}
        onPress={() => onDartPress(score)}
        disabled={disabled}
        variant="outline"
        size="sm"
        style={[
          styles.dartButton,
          { 
            borderColor: getDartColor(score),
            backgroundColor: getDartColor(score),
            minWidth: isSpecial ? 80 : 50,
          }
        ]}
        textStyle={[
          styles.dartButtonText,
          { color: isDark ? '#ffffff' : '#000000' }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.dartGrid}>
        {standardNumbers.map(renderDartButton)}
        {specialScores.map(renderDartButton)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  dartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  dartButton: {
    minHeight: 44,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  dartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});