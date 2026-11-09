import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { Strings } from '../constants/Strings';
import { Header } from '../components/Header';

interface SupportResource {
  id: string;
  name: string;
  amharicName: string;
  category: 'legal' | 'emergency' | 'union' | 'advocacy';
  phone?: string;
  location: string;
  description: string;
  amharicDesc: string;
}

const RESOURCES: SupportResource[] = [
  {
    id: 'ewla',
    name: 'Ethiopian Women Lawyers Association (EWLA)',
    amharicName: 'የኢትዮጵያ ሴት ጠበቆች ማህበር',
    category: 'legal',
    phone: '6922',
    location: 'Addis Ababa & Regional Offices',
    description: 'Free legal aid, counsel, and representation for women and domestic workers.',
    amharicDesc: 'ነፃ የሕግ ድጋፍ፣ የምክር እና የጥብቅና አገልግሎት ለሴቶች እና ለቤት ሠራተኞች።',
  },
  {
    id: 'cetu',
    name: 'Confederation of Ethiopian Trade Unions (CETU)',
    amharicName: 'የኢትዮጵያ ሠራተኛ ማኅበራት ኮንፌዴሬሽን',
    category: 'union',
    phone: '+251 11 551 5444',
    location: 'Meskel Square, Addis Ababa',
    description: 'Labour dispute assistance, workplace rights defense, and collective bargaining guidance.',
    amharicDesc: 'የሥራ ክርክር ድጋፍ፣ የሥራ ቦታ መብቶች ጥበቃ እና የህብረት ድርድር መመሪያ።',
  },
  {
    id: 'mols',
    name: 'Ministry of Labour and Skills (MOLS)',
    amharicName: 'የሥራና ክህሎት ሚኒስቴር',
    category: 'advocacy',
    phone: '8221',
    location: 'Kazanchis, Addis Ababa',
    description: 'Government labour inspection authority under Proclamation No. 1156/2019.',
    amharicDesc: 'በአዋጅ ቁጥር 1156/2019 መሠረት የመንግሥት የሥራ ቁጥጥር እና የቅሬታ መቀበያ።',
  },
  {
    id: 'aau-clinic',
    name: 'AAU Free Legal Aid Clinic',
    amharicName: 'የአዲስ አበባ ዩኒቨርሲቲ ነፃ የሕግ ክሊኒክ',
    category: 'legal',
    phone: '+251 11 123 9700',
    location: 'Sidist Kilo, Addis Ababa',
    description: 'Pro bono assistance with unpaid wages, unlawful termination, and severance pay claims.',
    amharicDesc: 'ላልተከፈለ ደሞዝ፣ ያለ አግባብ ከሥራ መባረር እና የስንብት ክፍያ የነፃ የሕግ ድጋፍ።',
  },
  {
    id: 'police-emergency',
    name: 'Federal Police Emergency Line',
    amharicName: 'የፌዴራል ፖሊስ አስቸኳይ ስልክ',
    category: 'emergency',
    phone: '991',
    location: 'Nationwide',
    description: 'Immediate emergency response for abuse, unlawful confinement, or violence.',
    amharicDesc: 'ጥቃት፣ ያለፈቃድ ማሰር ወይም ሁከት ሲያጋጥም አፋጣኝ የድንገተኛ ምላሽ።',
  },
];

export default function CommunitySupportScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'legal' | 'emergency' | 'union'>('all');

  const handleQuickExit = () => {
    // Immediate Safety Exit: redirect directly to Calculator UI
    router.replace('/calculator');
  };

  const handleCall = (phone: string, name: string) => {
    Alert.alert(
      'Contact Support / ድጋፍ ሰጪን ይደውሉ',
      `Call ${name} at ${phone}? / ወደ ${name} በ ${phone} ይደውሉ?`,
      [
        { text: 'Cancel / ሰርዝ', style: 'cancel' },
        {
          text: 'Call / ደውል',
          style: 'default',
          onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`),
        },
      ]
    );
  };

  const filteredResources = activeTab === 'all'
    ? RESOURCES
    : RESOURCES.filter(r => r.category === activeTab);

  return (
    <View style={styles.container}>
      <Header
        title="Community Support / የማህበረሰብ ድጋፍ"
        onQuickExit={handleQuickExit}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Support Preview Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="people" size={28} color={Colors.text} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Support Preview / የድጋፍ ቅድመ እይታ</Text>
            <Text style={styles.bannerSub}>
              Verified legal aid clinics, labour unions, and emergency hotlines across Ethiopia.
            </Text>
          </View>
        </View>

        {/* Safety Hotline Callout */}
        <TouchableOpacity
          style={styles.hotlineAlert}
          onPress={() => handleCall('6922', 'EWLA Legal Aid')}
          activeOpacity={0.85}
        >
          <View style={styles.hotlineLeft}>
            <Ionicons name="call" size={22} color={Colors.text} />
            <View>
              <Text style={styles.hotlineTitle}>Toll-Free Legal Helpline: 6922</Text>
              <Text style={styles.hotlineSub}>የነፃ የሕግ ድጋፍ የስልክ መስመር (EWLA)</Text>
            </View>
          </View>
          <View style={styles.callPill}>
            <Text style={styles.callPillText}>Call / ደውል</Text>
          </View>
        </TouchableOpacity>

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          {[
            { id: 'all', label: 'All / ሁሉም' },
            { id: 'legal', label: 'Legal Aid / ሕግ' },
            { id: 'union', label: 'Unions / ማኅበራት' },
            { id: 'emergency', label: 'Emergency / ድንገተኛ' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resource Cards */}
        {filteredResources.map((res) => (
          <View key={res.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeCategory}>
                <Ionicons
                  name={
                    res.category === 'emergency'
                      ? 'alert-circle'
                      : res.category === 'legal'
                      ? 'briefcase'
                      : 'shield'
                  }
                  size={14}
                  color={res.category === 'emergency' ? Colors.accent : Colors.primaryLight}
                />
                <Text style={styles.badgeCategoryText}>
                  {res.category.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.locationText}>
                <Ionicons name="location-outline" size={12} color={Colors.textMuted} /> {res.location}
              </Text>
            </View>

            <Text style={styles.resName}>{res.name}</Text>
            <Text style={styles.resAmharicName}>{res.amharicName}</Text>
            <Text style={styles.resDesc}>{res.description}</Text>
            <Text style={styles.resAmharicDesc}>{res.amharicDesc}</Text>

            {res.phone && (
              <TouchableOpacity
                style={styles.cardCallBtn}
                onPress={() => handleCall(res.phone!, res.name)}
                activeOpacity={0.8}
              >
                <Ionicons name="call-outline" size={16} color={Colors.text} />
                <Text style={styles.cardCallBtnText}>
                  {res.phone} — Call Now / አሁን ይደውሉ
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Legal Rights Dispute Guidance per Art. 32 */}
        <View style={styles.disputeSection}>
          <View style={styles.disputeHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primaryLight} />
            <Text style={styles.disputeTitle}>
              Dispute Resolution Guide / የክርክር አፈታት መመሪያ
            </Text>
          </View>
          <Text style={styles.disputeText}>
            Under <Text style={styles.boldText}>Proclamation No. 1156/2019, Article 32</Text>, any dispute regarding unpaid wages, overtime compensation, or unlawful termination must follow standard redressal stages:
          </Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepDesc}>Internal Grievance Committee submission / ለውስጥ ቅሬታ ሰሚ ኮሚቴ ማቅረብ</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepDesc}>Labour Inspection Directorate conciliation / በሥራ ቁጥጥር በኩል ድርድር</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepDesc}>Labour Relations Board or Labour Court adjudication / ለሥራ ክርክር ቦርድ ማቅረብ</Text>
          </View>
        </View>

        {/* Disclaimer Footer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>{Strings.disclaimer}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  bannerIconBox: {
    width: 50,
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    color: Colors.text,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    marginBottom: 2,
  },
  bannerSub: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    lineHeight: 16,
  },
  hotlineAlert: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  hotlineLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  hotlineTitle: { color: Colors.text, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold },
  hotlineSub: { color: Colors.textSecondary, fontSize: Typography.fontSizeXS },
  callPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  callPillText: { color: Colors.text, fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold },
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
  },
  activeTabText: {
    color: Colors.text,
    fontWeight: Typography.fontWeightBold,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeCategoryText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS - 1,
    fontWeight: Typography.fontWeightBold,
  },
  locationText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
  },
  resName: {
    color: Colors.text,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    marginBottom: 2,
  },
  resAmharicName: {
    color: Colors.primaryLight,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    marginBottom: Spacing.xs,
  },
  resDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    lineHeight: 18,
    marginBottom: 2,
  },
  resAmharicDesc: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  cardCallBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  cardCallBtnText: {
    color: Colors.text,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
  },
  disputeSection: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  disputeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  disputeTitle: {
    color: Colors.text,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
  },
  disputeText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  boldText: {
    color: Colors.text,
    fontWeight: Typography.fontWeightBold,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: Colors.text,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
  },
  stepDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    lineHeight: 18,
    flex: 1,
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  disclaimerText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    flex: 1,
    lineHeight: 16,
  },
});

