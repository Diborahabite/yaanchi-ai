import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  sublabel?: string;
}

export function ResultCard({ label, value, highlight = false, sublabel }: ResultCardProps) {
  return (
    <View style={[styles.container, highlight && styles.highlighted]}>
      <Text style={[styles.label, highlight && styles.labelHighlight]}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  highlighted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    marginBottom: 2,
  },
  labelHighlight: {
    color: 'rgba(255,255,255,0.8)',
  },
  sublabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    marginBottom: 4,
  },
  value: {
    color: Colors.text,
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    marginTop: 4,
  },
  valueHighlight: {
    color: Colors.text,
    fontSize: Typography.fontSizeXXL,
  },
});
