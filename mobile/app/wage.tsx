import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { Strings } from '../constants/Strings';
import { Header } from '../components/Header';
import { ResultCard } from '../components/ResultCard';
import { useWageCalculator } from '../hooks/useWageCalculator';

export default function WageCalculatorScreen() {
  const router = useRouter();
  const { result, loading, error, calculate, reset } = useWageCalculator();

  const [basicMonthlyPay, setBasicMonthlyPay] = useState('10400');
  const [monthlyHoursDivisor, setMonthlyHoursDivisor] = useState('208');
  const [daytimeHours, setDaytimeHours] = useState('4');
  const [nighttimeHours, setNighttimeHours] = useState('2');
  const [restDayHours, setRestDayHours] = useState('4');
  const [publicHolidayHours, setPublicHolidayHours] = useState('8');

  const handleCalculate = async () => {
    const basic = parseFloat(basicMonthlyPay);
    const divisor = parseFloat(monthlyHoursDivisor) || 208;
    const daytime = parseFloat(daytimeHours) || 0;
    const nighttime = parseFloat(nighttimeHours) || 0;
    const restDay = parseFloat(restDayHours) || 0;
    const holiday = parseFloat(publicHolidayHours) || 0;

    if (!basicMonthlyPay || isNaN(basic) || basic <= 0) {
      Alert.alert('Input Error', 'Please enter a valid Basic Monthly Pay greater than 0.');
      return;
    }
    if (daytime < 0 || nighttime < 0 || restDay < 0 || holiday < 0) {
      Alert.alert('Input Error', 'Hours cannot be negative.');
      return;
    }

    await calculate({
      basic_monthly_pay: basic,
      monthly_hours_divisor: divisor,
      daytime_overtime_hours: daytime,
      nighttime_overtime_hours: nighttime,
      rest_day_overtime_hours: restDay,
      public_holiday_overtime_hours: holiday,
    });
  };

  const handleClear = () => {
    setDaytimeHours('0');
    setNighttimeHours('0');
    setRestDayHours('0');
    setPublicHolidayHours('0');
    reset();
    router.back();
  };

  const handleQuickExit = () => {
    // Immediate Safety Exit: wipe inputs and redirect to stealth normal calculator
    setDaytimeHours('0');
    setNighttimeHours('0');
    setRestDayHours('0');
    setPublicHolidayHours('0');
    reset();
    router.replace('/calculator');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="Wage & Overtime / ደመወዝ ሲሳይ" onQuickExit={handleQuickExit} />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>📊 Statutory Wage Inputs / የደመወዝ ዝርዝር</Text>

          {/* Basic Monthly Pay */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Basic Monthly Pay (ETB) / የወር መሠረታዊ ደመወዝ</Text>
            <Text style={styles.hintText}>Gross monthly pay before overtime</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>ETB</Text>
              <TextInput
                style={styles.input}
                value={basicMonthlyPay}
                onChangeText={setBasicMonthlyPay}
                keyboardType="decimal-pad"
                placeholder="10400"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Monthly Hours Divisor */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Hours Divisor / የወር መደበኛ የሥራ ሰዓት</Text>
            <Text style={styles.hintText}>Default: 208 hrs (48 hrs/week, Art. 61)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>HRS</Text>
              <TextInput
                style={styles.input}
                value={monthlyHoursDivisor}
                onChangeText={setMonthlyHoursDivisor}
                keyboardType="decimal-pad"
                placeholder="208"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Daytime Overtime */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daytime Overtime (6 AM – 10 PM) / የቀን ትርፍ ሰዓት</Text>
            <Text style={styles.hintText}>1.5× Rate Multiplier (Art. 68(1)(a))</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>1.5×</Text>
              <TextInput
                style={styles.input}
                value={daytimeHours}
                onChangeText={setDaytimeHours}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Nighttime Overtime */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nighttime Overtime (10 PM – 6 AM) / የሌሊት ትርፍ ሰዓት</Text>
            <Text style={styles.hintText}>1.75× Rate Multiplier (Art. 68(1)(b))</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>1.75×</Text>
              <TextInput
                style={styles.input}
                value={nighttimeHours}
                onChangeText={setNighttimeHours}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Weekly Rest Day */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weekly Rest Day Hours / የዕረፍት ቀን የሥራ ሰዓት</Text>
            <Text style={styles.hintText}>2.0× Rate Multiplier (Art. 68(1)(c))</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>2.0×</Text>
              <TextInput
                style={styles.input}
                value={restDayHours}
                onChangeText={setRestDayHours}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          {/* Public Holiday */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Public Holiday Hours / የሕዝብ በዓል የሥራ ሰዓት</Text>
            <Text style={styles.hintText}>2.5× Rate Multiplier (Art. 68(1)(d))</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencyPrefix}>2.5×</Text>
              <TextInput
                style={styles.input}
                value={publicHolidayHours}
                onChangeText={setPublicHolidayHours}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.calcBtn, loading && styles.calcBtnDisabled]}
          onPress={handleCalculate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.text} size="small" />
          ) : (
            <>
              <Ionicons name="calculator" size={20} color={Colors.text} />
              <Text style={styles.calcBtnText}>Compute Breakdown / ደመወዝ አስላ</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClear} activeOpacity={0.75}>
          <Ionicons name="refresh" size={18} color={Colors.textSecondary} />
          <Text style={styles.clearBtnText}>Clear and Return / አጽዳ እና ተመለስ</Text>
        </TouchableOpacity>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Results Container (MANDATORY ORDER: Breakdown FIRST, Final Results SECOND) */}
        {result && (
          <View style={styles.resultsSection}>
            {/* 1. Category Breakdown FIRST */}
            <Text style={styles.breakdownHeader}>1. Calculation Breakdown by Category</Text>

            <ResultCard
              label="Base Hourly Rate / መሠረታዊ የሰዓት ተመን"
              value={`${result.hourly_rate.toFixed(2)} ETB/hr`}
              sublabel={result.breakdown.base_hourly_rate.formula}
            />

            <ResultCard
              label="Daytime Overtime (1.5×) / የቀን ትርፍ ሰዓት"
              value={`${result.breakdown.daytime_overtime.subtotal?.toFixed(2)} ETB`}
              sublabel={result.breakdown.daytime_overtime.formula}
            />

            <ResultCard
              label="Nighttime Overtime (1.75×) / የሌሊት ትርፍ ሰዓት"
              value={`${result.breakdown.nighttime_overtime.subtotal?.toFixed(2)} ETB`}
              sublabel={result.breakdown.nighttime_overtime.formula}
            />

            <ResultCard
              label="Weekly Rest Day Overtime (2.0×) / የዕረፍት ቀን"
              value={`${result.breakdown.weekly_rest_day_overtime.subtotal?.toFixed(2)} ETB`}
              sublabel={result.breakdown.weekly_rest_day_overtime.formula}
            />

            <ResultCard
              label="Public Holiday Overtime (2.5×) / የሕዝብ በዓል"
              value={`${result.breakdown.public_holiday_overtime.subtotal?.toFixed(2)} ETB`}
              sublabel={result.breakdown.public_holiday_overtime.formula}
            />

            {/* 2. Final Calculated Results SECOND */}
            <Text style={[styles.breakdownHeader, { marginTop: Spacing.lg }]}>2. Final Calculated Results</Text>

            <ResultCard
              label="Total Overtime Pay / ጠቅላላ የትርፍ ሰዓት ክፍያ"
              value={`${result.final_results.total_overtime_pay.toFixed(2)} ETB`}
            />

            <ResultCard
              label="Gross Earnings (Basic + Overtime) / ጠቅላላ ተከፋይ"
              value={`${result.final_results.gross_earnings.toFixed(2)} ETB`}
              highlight
            />

            {/* Formatted Output Template Container */}
            <View style={styles.templateBox}>
              <Text style={styles.templateHeader}>Output Template Format:</Text>
              <Text style={styles.templateText}>{result.formatted_text}</Text>
            </View>

            {/* Legal References */}
            <View style={styles.legalBox}>
              <Text style={styles.legalTitle}>Legal References (Proclamation No. 1156/2019):</Text>
              {result.legal_references.map((ref, i) => (
                <Text key={i} style={styles.legalRef}>• {ref}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer Footer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Statutory calculation under Ethiopian Labour Proclamation No. 1156/2019. Standard divisor: 208 hrs/month. Consult a qualified labour lawyer for legal advice.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  body: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  section: { marginBottom: Spacing.md },
  sectionHeader: {
    color: Colors.text, fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold, marginBottom: Spacing.md,
  },
  breakdownHeader: {
    color: Colors.text,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingBottom: 4,
  },
  inputGroup: { marginBottom: Spacing.md },
  label: { color: Colors.text, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium, marginBottom: 2 },
  hintText: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, marginBottom: Spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBg, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.inputBorder, overflow: 'hidden',
  },
  currencyPrefix: {
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md,
    backgroundColor: Colors.card, color: Colors.textMuted,
    fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold,
    borderRightWidth: 1, borderRightColor: Colors.inputBorder,
    minWidth: 50, textAlign: 'center',
  },
  input: {
    flex: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    color: Colors.text, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightMedium,
  },
  calcBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  calcBtnDisabled: { opacity: 0.6 },
  calcBtnText: { color: Colors.text, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightBold },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  clearBtnText: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM },
  errorBox: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
    backgroundColor: Colors.error + '22', borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.error + '44',
  },
  errorText: { color: Colors.error, fontSize: Typography.fontSizeSM, flex: 1 },
  resultsSection: { marginBottom: Spacing.md },
  templateBox: {
    backgroundColor: '#141414',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: Spacing.md,
  },
  templateHeader: {
    color: Colors.primaryLight,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.xs,
  },
  templateText: {
    color: '#D0D0D0',
    fontSize: Typography.fontSizeXS,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  legalBox: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder,
    marginTop: Spacing.sm,
  },
  legalTitle: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, marginBottom: Spacing.sm },
  legalRef: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, lineHeight: 18, marginBottom: 4 },
  disclaimerBox: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  disclaimerText: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, flex: 1, lineHeight: 16 },
});
