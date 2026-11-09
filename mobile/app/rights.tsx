import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { Header } from '../components/Header';

const RIGHTS_TOPICS = [
  {
    id: 'working-hours',
    icon: 'time-outline' as const,
    title: 'Working Hours / የሥራ ሰዓቶች',
    summary: 'Normal working hours shall not exceed 8 hours per day and 48 hours per week.',
    article: 'Art. 61 — Proclamation No. 1156/2019',
    color: '#1565C0',
  },
  {
    id: 'overtime',
    icon: 'trending-up-outline' as const,
    title: 'Overtime Rights / ትርፍ ሰዓት መብቶች',
    summary: 'Overtime work shall be paid at 1.5x normal rate. Rest-day and holiday work at 2.0x.',
    article: 'Art. 68–69 — Proclamation No. 1156/2019',
    color: '#800020',
  },
  {
    id: 'leave',
    icon: 'calendar-outline' as const,
    title: 'Annual Leave / ዓመታዊ ፈቃድ',
    summary: 'Workers are entitled to paid annual leave based on years of service.',
    article: 'Art. 78 — Proclamation No. 1156/2019',
    color: '#2E7D32',
  },
  {
    id: 'termination',
    icon: 'close-circle-outline' as const,
    title: 'Termination Rights / የማቋረጥ መብቶች',
    summary: 'Unlawful termination entitles workers to reinstatement or severance compensation.',
    article: 'Art. 43–45 — Proclamation No. 1156/2019',
    color: '#E65100',
  },
  {
    id: 'maternity',
    icon: 'heart-outline' as const,
    title: 'Maternity Leave / የወሊድ ፈቃድ',
    summary: 'Female workers are entitled to 90 days of paid maternity leave.',
    article: 'Art. 88 — Proclamation No. 1156/2019',
    color: '#6A1B9A',
  },
  {
    id: 'safety',
    icon: 'shield-checkmark-outline' as const,
    title: 'Workplace Safety / የሥራ ቦታ ደህንነት',
    summary: 'Employers must ensure a safe and healthy working environment for all workers.',
    article: 'Art. 92 — Proclamation No. 1156/2019',
    color: '#00695C',
  },
];

export default function WorkerRightsScreen() {
  const router = useRouter();

  const handleQuickExit = () => {
    // Immediate Safety Exit: redirect directly to Calculator UI
    router.replace('/calculator');
  };

  return (
    <View style={styles.container}>
      <Header title="Worker Rights / የሰራተኛ መብቶች" onQuickExit={handleQuickExit} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          Your rights under Ethiopian Labour Proclamation No. 1156/2019
        </Text>

        {RIGHTS_TOPICS.map((topic) => (
          <View key={topic.id} style={styles.topicCard}>
            <View style={styles.topicHeader}>
              <View style={[styles.topicIconContainer, { backgroundColor: topic.color + '22' }]}>
                <Ionicons name={topic.icon} size={24} color={topic.color} />
              </View>
              <View style={styles.topicTitleContainer}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicArticle}>{topic.article}</Text>
              </View>
            </View>
            <Text style={styles.topicSummary}>{topic.summary}</Text>
          </View>
        ))}

        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>
            This is an informational summary. For legal representation, consult a qualified labour lawyer.
            / ይህ መረጃዊ ማጠቃለያ ነው። ለሕጋዊ ውክልና ብቁ የሠራተኛ ጠበቃን ያማክሩ።
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  introText: {
    color: Colors.textSecondary, fontSize: Typography.fontSizeMD,
    lineHeight: 22, marginBottom: Spacing.lg, textAlign: 'center',
  },
  topicCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  topicHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  topicIconContainer: {
    width: 48, height: 48, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  topicTitleContainer: { flex: 1 },
  topicTitle: {
    color: Colors.text, fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold, lineHeight: 20,
  },
  topicArticle: {
    color: Colors.primary, fontSize: Typography.fontSizeXS,
    marginTop: 2,
  },
  topicSummary: {
    color: Colors.textSecondary, fontSize: Typography.fontSizeSM,
    lineHeight: 20,
  },
  disclaimerBox: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder,
    marginTop: Spacing.sm,
  },
  disclaimerText: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, flex: 1, lineHeight: 16 },
});
