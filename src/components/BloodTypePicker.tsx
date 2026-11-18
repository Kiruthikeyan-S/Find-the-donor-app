import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BLOOD_TYPES, COLORS } from '../theme';

interface BloodTypePickerProps {
  selected: string;
  onSelect: (bloodType: string) => void;
}

export function BloodTypePicker({ selected, onSelect }: BloodTypePickerProps) {
  return (
    <View style={styles.grid}>
      {BLOOD_TYPES.map((type) => {
        const isActive = selected === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelect(type)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  pillTextActive: {
    color: COLORS.white,
  },
});
