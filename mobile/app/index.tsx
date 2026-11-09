import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Alert, Platform, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { Strings } from '../constants/Strings';

export default function ModeSelectionScreen() {
  const router = useRouter();

  const handleQuickExit = () => {
    // Immediate Safety Exit: redirect directly to Calculator UI
    router.replace('/calculator');
  };

  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight ?? 24;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + Spacing.sm }]}>
        <View style={styles.headerInner}>
          <View style={{ minWidth: 70 }} />
          <View style={styles.brandContainer}>
            <Text style={styles.appName}>{Strings.appName}</Text>
            <Text style={styles.appTagline}>{Strings.appTagline}</Text>
          </View>
          <TouchableOpacity style={styles.exitBtn} onPress={handleQuickExit}>
            <Ionicons name="exit-outline" size={18} color={Colors.warning} />
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Logo / Shield */}
        <View style={styles.logoContainer}>
          <View style={styles.shield}>
            <Ionicons name="shield-checkmark" size={48} color={Colors.text} />
          </View>
          <Text style={styles.heroTitle}>Ethiopian Labour Law{'\n'}Legal Guidance Platform</Text>
          <Text style={styles.heroSub}>Under Proclamation No. 1156/2019</Text>
        </View>

        <Text style={styles.sectionTitle}>{Strings.modeSelectionTitle}</Text>

        {/* Option 1: Secure Account */}
        <View style={styles.optionCard}>
          <View style={styles.optionIconRow}>
            <Ionicons name="person-circle" size={28} color={Colors.primary} />
            <Text style={styles.optionTitle}>{Strings.secureAccountTitle}</Text>
          </View>
          <Text style={styles.optionDesc}>{Strings.secureAccountDesc}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>✓ Certificates Saved</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>✓ Progress Tracked</Text></View>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/hub')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{Strings.continueWithAccount}</Text>
          </TouchableOpacity>
        </View>

        {/* Option 2: Ghost Mode */}
        <View style={[styles.optionCard, styles.ghostCard]}>
          <View style={styles.optionIconRow}>
            <Ionicons name="glasses-outline" size={28} color={Colors.textSecondary} />
            <Text style={[styles.optionTitle, { color: Colors.textSecondary }]}>{Strings.ghostModeTitle}</Text>
          </View>
          <Text style={styles.optionDesc}>{Strings.ghostModeDesc}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.ghostBadge]}><Text style={styles.badgeText}>🔒 No Account</Text></View>
            <View style={[styles.badge, styles.ghostBadge]}><Text style={styles.badgeText}>🗑 Auto-Purge</Text></View>
          </View>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => router.push('/hub?ghost=true')}
            activeOpacity={0.85}
          >
            <Text style={styles.ghostBtnText}>{Strings.continueAnonymous}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          🇪🇹 Built for Ethiopian domestic workers{'\n'}
          Proclamation No. 1156/2019
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    elevation: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandContainer: { alignItems: 'center', flex: 1 },
  appName: { color: Colors.text, fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightExtraBold, letterSpacing: 1 },
  appTagline: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSizeXS, marginTop: 2 },
  exitBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 70, justifyContent: 'flex-end' },
  exitText: { color: Colors.warning, fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightMedium },
  body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  logoContainer: { alignItems: 'center', marginVertical: Spacing.xl },
  shield: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: { color: Colors.text, fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold, textAlign: 'center', lineHeight: 28 },
  heroSub: { color: Colors.textMuted, fontSize: Typography.fontSizeSM, marginTop: 6, textAlign: 'center' },
  sectionTitle: { color: Colors.textSecondary, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightMedium, textAlign: 'center', marginBottom: Spacing.md },
  optionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  ghostCard: { borderColor: '#3A3A3A' },
  optionIconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  optionTitle: { color: Colors.text, fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold },
  optionDesc: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM, lineHeight: 20, marginBottom: Spacing.sm },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  badge: { backgroundColor: 'rgba(128,0,32,0.2)', borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  ghostBadge: { backgroundColor: 'rgba(255,255,255,0.08)' },
  badgeText: { color: Colors.textSecondary, fontSize: Typography.fontSizeXS },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  primaryBtnText: { color: Colors.text, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold },
  ghostBtn: {
    backgroundColor: 'transparent', borderRadius: Radius.md,
    paddingVertical: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  ghostBtnText: { color: Colors.textSecondary, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightMedium },
  footer: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 },
});
