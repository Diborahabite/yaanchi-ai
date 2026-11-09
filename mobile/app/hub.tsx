import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { Strings } from '../constants/Strings';
import { Header } from '../components/Header';

interface HubCard {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const HUB_CARDS: HubCard[] = [
  {
    id: 'wage',
    title: Strings.wageCard,
    subtitle: Strings.wageCardSub,
    icon: 'calculator',
    route: '/wage',
    color: '#800020',
  },
  {
    id: 'rights',
    title: Strings.rightsCard,
    subtitle: Strings.rightsCardSub,
    icon: 'document-text',
    route: '/rights',
    color: '#1565C0',
  },
  {
    id: 'community',
    title: Strings.communityCard,
    subtitle: Strings.communityCardSub,
    icon: 'people',
    route: '/community',
    color: '#2E7D32',
  },
  {
    id: 'voice',
    title: Strings.voiceCard,
    subtitle: Strings.voiceCardSub,
    icon: 'mic',
    route: '/voice',
    color: '#6A1B9A',
  },
];

export default function HubScreen() {
  const router = useRouter();
  const { ghost } = useLocalSearchParams<{ ghost?: string }>();
  const isGhostMode = ghost === 'true';

  const handleQuickExit = () => {
    // Immediate Safety Exit: wipe session state and redirect directly to Calculator UI
    router.replace('/calculator');
  };

  const handleCardPress = (card: HubCard) => {
    router.push(card.route as any);
  };

  return (
    <View style={styles.container}>
      <Header showBack title={Strings.mainHubTitle} onQuickExit={handleQuickExit} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {isGhostMode && (
          <View style={styles.ghostBanner}>
            <Ionicons name="glasses-outline" size={16} color={Colors.warning} />
            <Text style={styles.ghostBannerText}>Ghost Mode — No data stored / ምንም ውሂብ አይቀመጥም</Text>
          </View>
        )}

        <Text style={styles.greeting}>
          Welcome to Yanchi AI{'\n'}
          <Text style={styles.greetingSub}>What do you need help with today?</Text>
        </Text>

        {/* 2x2 Grid */}
        <View style={styles.grid}>
          {HUB_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardIconContainer, { backgroundColor: card.color + '22' }]}>
                <Ionicons name={card.icon} size={32} color={card.color} />
              </View>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward-circle" size={20} color={card.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Reference */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            All guidance is based on Ethiopian Labour Proclamation No. 1156/2019.
            For legal representation, consult a qualified lawyer.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  ghostBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(255,152,0,0.1)',
    borderRadius: Radius.md, padding: Spacing.sm,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '44',
  },
  ghostBannerText: { color: Colors.warning, fontSize: Typography.fontSizeXS, flex: 1 },
  greeting: {
    color: Colors.text, fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold, marginBottom: Spacing.lg,
    lineHeight: 32,
  },
  greetingSub: { color: Colors.textSecondary, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightNormal },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: Spacing.md,
    width: '47%', borderWidth: 1, borderColor: Colors.cardBorder,
    minHeight: 160,
  },
  cardIconContainer: {
    width: 56, height: 56, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    color: Colors.text, fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold, lineHeight: 18, marginBottom: 4,
  },
  cardSubtitle: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, lineHeight: 16, flex: 1 },
  cardArrow: { alignSelf: 'flex-end', marginTop: Spacing.sm },
  infoBox: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'flex-start',
  },
  infoText: { color: Colors.textSecondary, fontSize: Typography.fontSizeXS, flex: 1, lineHeight: 18 },
});
