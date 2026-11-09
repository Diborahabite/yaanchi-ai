import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/Theme';
import { Strings } from '../constants/Strings';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  onQuickExit?: () => void;
}

export function Header({ showBack = true, title, onQuickExit }: HeaderProps) {
  const router = useRouter();
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight ?? 24;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + Spacing.sm }]}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel={Strings.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={Colors.text} />
            <Text style={styles.backText}>Back / ተመለስ</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>{Strings.appName}</Text>
        </View>

        <TouchableOpacity
          style={styles.exitBtn}
          onPress={onQuickExit}
          accessibilityLabel={Strings.quickExit}
          activeOpacity={0.7}
        >
          <Ionicons name="exit-outline" size={16} color={Colors.warning} />
          <Text style={styles.exitText}>Quick Exit / አሸንፊደ ውጣ</Text>
        </TouchableOpacity>
      </View>

      {title ? (
        <View style={styles.subHeader}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  backText: {
    color: Colors.text,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
  },
  placeholder: {
    flex: 1,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  brandText: {
    color: Colors.text,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightExtraBold,
    letterSpacing: 0.5,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
    flex: 1,
  },
  exitText: {
    color: Colors.warning,
    fontSize: Typography.fontSizeXS - 1,
    fontWeight: Typography.fontWeightBold,
  },
  subHeader: {
    alignItems: 'center',
    marginTop: 4,
  },
  titleText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
  },
});
