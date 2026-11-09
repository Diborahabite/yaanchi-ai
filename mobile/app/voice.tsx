import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { Strings } from '../constants/Strings';
import { Header } from '../components/Header';
import { useLegalQA } from '../hooks/useLegalQA';

type VoiceState = 'idle' | 'listening' | 'processing' | 'done';

const SAMPLE_QUESTIONS = [
  {
    amharic: 'የትርፍ ሰዓት ክፍያ ተመን ስንት ነው?',
    english: 'What is the overtime pay rate under Proclamation 1156/2019?',
    tag: 'Overtime (Art. 68)',
  },
  {
    amharic: 'የዕረፍት ቀን ወይም የበዓል የሥራ ክፍያ ስንት ነው?',
    english: 'What is the rest-day or holiday work rate?',
    tag: 'Rest Days (Art. 69)',
  },
  {
    amharic: 'የወሊድ ፈቃድ ስንት ቀናት ነው?',
    english: 'What is the maternity leave entitlement?',
    tag: 'Maternity (Art. 67)',
  },
  {
    amharic: 'መደበኛ የሥራ ሰዓት ስንት ነው?',
    english: 'What are normal working hours per day and week?',
    tag: 'Hours (Art. 61)',
  },
];

export default function VoiceAssistantScreen() {
  const router = useRouter();
  const { result, loading, error, ask, reset } = useLegalQA();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1.0 | 1.5 | 2.0>(1.0);
  const [audioProgress, setAudioProgress] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startPulse = () => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  };

  const stopPulse = () => {
    pulseRef.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + (5 * playbackSpeed);
        });
      }, 500);
    } else {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const handleMicPress = async () => {
    if (voiceState === 'idle') {
      setVoiceState('listening');
      startPulse();

      // Simulate listening and picking up an Amharic question
      setTimeout(() => {
        setVoiceState('processing');
        stopPulse();
        const detectedQuestion = 'የትርፍ ሰዓት ክፍያ ተመን ስንት ነው? / What are my overtime rights?';
        setTranscript(detectedQuestion);

        ask('What are my rights regarding overtime pay?', 'en', true).then(() => {
          setVoiceState('done');
          setAudioProgress(0);
          setIsPlaying(true);
        });
      }, 2500);
    } else if (voiceState === 'listening') {
      stopPulse();
      setVoiceState('idle');
    } else if (voiceState === 'done') {
      stopPulse();
      setVoiceState('idle');
      setTranscript('');
      setIsPlaying(false);
      setAudioProgress(0);
      reset();
    }
  };

  const handleSampleSelect = (q: typeof SAMPLE_QUESTIONS[0]) => {
    setVoiceState('processing');
    setTranscript(`${q.amharic} (${q.english})`);
    ask(q.english, 'en', true).then(() => {
      setVoiceState('done');
      setAudioProgress(0);
      setIsPlaying(true);
    });
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    const query = manualInput.trim();
    setManualInput('');
    setShowManualInput(false);
    setVoiceState('processing');
    setTranscript(query);
    ask(query, 'en', true).then(() => {
      setVoiceState('done');
      setAudioProgress(0);
      setIsPlaying(true);
    });
  };

  const handleQuickExit = () => {
    // Immediate Safety Exit: stop audio playback, purge voice session, and redirect to Calculator UI
    setIsPlaying(false);
    reset();
    router.replace('/calculator');
  };

  const getMicIcon = (): keyof typeof Ionicons.glyphMap => {
    if (voiceState === 'listening') return 'radio-button-on';
    if (voiceState === 'processing') return 'hourglass';
    if (voiceState === 'done') return 'refresh';
    return 'mic';
  };

  const getMicLabel = () => {
    if (voiceState === 'listening') return Strings.voiceListening;
    if (voiceState === 'processing') return Strings.voiceProcessing;
    if (voiceState === 'done') return 'Tap to ask another question / እንደገና ይጠይቁ';
    return Strings.voicePrompt;
  };

  const togglePlayback = () => setIsPlaying(!isPlaying);

  const toggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0));
  };

  return (
    <View style={styles.container}>
      <Header
        title={Strings.voiceAssistantTitle}
        onQuickExit={handleQuickExit}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Ephemeral Notice */}
        <View style={styles.privacyBanner}>
          <Ionicons name="lock-closed" size={16} color={Colors.success} />
          <Text style={styles.privacyText}>{Strings.ephemeralNotice}</Text>
        </View>

        {/* Central Mic Action Area */}
        <View style={styles.micSection}>
          <Animated.View style={[styles.micRipple, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.micButton,
                voiceState === 'listening' && styles.micButtonListening,
                voiceState === 'processing' && styles.micButtonProcessing,
              ]}
              onPress={handleMicPress}
              activeOpacity={0.85}
              accessibilityLabel={Strings.voicePrompt}
            >
              <Ionicons name={getMicIcon()} size={52} color={Colors.text} />
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.micLabel}>{getMicLabel()}</Text>
          <Text style={styles.micSublabel}>
            {voiceState === 'idle'
              ? 'Tap microphone to speak or pick a common question below'
              : voiceState === 'listening'
              ? 'Listening for Amharic or English speech...'
              : 'Consulting Proclamation No. 1156/2019...'}
          </Text>

          {/* Toggle Type Query */}
          <TouchableOpacity
            style={styles.toggleTextBtn}
            onPress={() => setShowManualInput(!showManualInput)}
          >
            <Ionicons name="keypad-outline" size={16} color={Colors.primaryLight} />
            <Text style={styles.toggleTextBtnLabel}>
              {showManualInput ? 'Hide keyboard input / የጽሁፍ መጠየቂያ ደብቅ' : 'Or type question / ወይም በጽሁፍ ይጠይቁ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Manual Input Container */}
        {showManualInput && (
          <View style={styles.manualInputCard}>
            <TextInput
              style={styles.textInput}
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="Type your labour law question..."
              placeholderTextColor={Colors.textMuted}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitQuestionBtn, !manualInput.trim() && styles.disabledBtn]}
              onPress={handleManualSubmit}
              disabled={!manualInput.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text} size="small" />
              ) : (
                <Text style={styles.submitQuestionText}>Ask Question / ጠይቅ</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Sample Voice Prompts for Quick Testing */}
        {voiceState === 'idle' && (
          <View style={styles.sampleSection}>
            <Text style={styles.sampleHeader}>Suggested Questions / የተጠቆሙ ጥያቄዎች:</Text>
            {SAMPLE_QUESTIONS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.sampleChip}
                onPress={() => handleSampleSelect(item)}
                activeOpacity={0.8}
              >
                <View style={styles.sampleIconBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.sampleTextBox}>
                  <Text style={styles.sampleAmharic}>{item.amharic}</Text>
                  <Text style={styles.sampleEnglish}>{item.english}</Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>{item.tag}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Transcript Container */}
        {transcript.length > 0 && (
          <View style={styles.transcriptBox}>
            <View style={styles.boxHeader}>
              <Ionicons name="text-outline" size={16} color={Colors.primaryLight} />
              <Text style={styles.boxTitle}>{Strings.transcriptLabel}</Text>
            </View>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        )}

        {/* Audio Player Controls Container */}
        {result && (
          <View style={styles.playerBox}>
            <View style={styles.playerHeader}>
              <View style={styles.playerTitleRow}>
                <Ionicons name="volume-medium-outline" size={18} color={Colors.primaryLight} />
                <Text style={styles.playerLabel}>Audio Response / የድምፅ ምላሽ</Text>
              </View>
              <TouchableOpacity style={styles.speedBtn} onPress={toggleSpeed}>
                <Text style={styles.speedText}>{playbackSpeed.toFixed(1)}x</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.playerControls}>
              <TouchableOpacity style={styles.playerBtn} onPress={togglePlayback}>
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={46}
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <View style={styles.trackContainer}>
                <View style={styles.playerTrack}>
                  <View style={[styles.playerProgress, { width: `${audioProgress}%` }]} />
                </View>
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    0:0{Math.floor(audioProgress / 20)}
                  </Text>
                  <Text style={styles.timeText}>0:05</Text>
                </View>
              </View>
            </View>

            <Text style={styles.playerHint}>
              {isPlaying ? 'Playing response audio… / ድምፁ እየተጫወተ ነው…' : Strings.playResponse}
            </Text>
          </View>
        )}

        {/* Legal Response Container */}
        {result && (
          <View style={styles.responseBox}>
            <View style={styles.boxHeader}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <Text style={styles.boxTitle}>{Strings.responseLabel}</Text>
            </View>

            <Text style={styles.responseText}>{result.answer}</Text>

            {result.sources.length > 0 && (
              <View style={styles.sourcesSection}>
                <Text style={styles.sourcesTitle}>
                  Cited Labour Articles / የተጠቀሱ የሕግ አንቀጾች:
                </Text>
                {result.sources.map((src, i) => (
                  <View key={i} style={styles.sourceItem}>
                    <Text style={styles.sourceArticle}>{src.article}</Text>
                    <Text style={styles.sourceText}>{src.text}</Text>
                    <Text style={styles.sourceScore}>
                      Match Relevance: {(src.relevance_score * 100).toFixed(0)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {result.legal_references.map((ref, i) => (
              <Text key={i} style={styles.legalRef}>
                📌 {ref}
              </Text>
            ))}

            {/* Zero-trust ephemeral notice */}
            <View style={styles.sessionPurgedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.sessionPurgedText}>
                Session data purged (Zero-trust ephemeral memory) / ክፍለ ጊዜ ውሂብ ተሰርዟል
              </Text>
            </View>
          </View>
        )}

        {/* Error Container */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
  privacyBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '44',
  },
  privacyText: {
    color: Colors.success,
    fontSize: Typography.fontSizeXS,
    flex: 1,
    lineHeight: 16,
  },
  micSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  micRipple: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(128,0,32,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  micButton: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  micButtonListening: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  micButtonProcessing: {
    backgroundColor: '#5C0016',
  },
  micLabel: {
    color: Colors.text,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  micSublabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  toggleTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  toggleTextBtnLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
  },
  manualInputCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textInput: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: Typography.fontSizeSM,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    marginBottom: Spacing.sm,
  },
  submitQuestionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.5 },
  submitQuestionText: {
    color: Colors.text,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
  },
  sampleSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sampleHeader: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  sampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  sampleIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleTextBox: { flex: 1 },
  sampleAmharic: {
    color: Colors.text,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
  },
  sampleEnglish: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS - 1,
    marginBottom: 2,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  tagBadgeText: {
    color: Colors.primaryLight,
    fontSize: Typography.fontSizeXS - 2,
    fontWeight: Typography.fontWeightBold,
  },
  transcriptBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  boxTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
  },
  transcriptText: {
    color: Colors.text,
    fontSize: Typography.fontSizeMD,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  playerBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '33',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  playerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  playerLabel: {
    color: Colors.text,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightBold,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  playerBtn: { padding: 2 },
  trackContainer: { flex: 1 },
  playerTrack: {
    height: 6,
    backgroundColor: Colors.inputBg,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  playerProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS - 2,
  },
  speedBtn: {
    backgroundColor: Colors.primary + '33',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  speedText: {
    color: Colors.text,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
  },
  playerHint: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    marginTop: 2,
  },
  responseBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  responseText: {
    color: Colors.text,
    fontSize: Typography.fontSizeSM,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  sourcesSection: { marginBottom: Spacing.sm },
  sourcesTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    marginBottom: Spacing.xs,
  },
  sourceItem: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sourceArticle: {
    color: Colors.primaryLight,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightBold,
    marginBottom: 2,
  },
  sourceText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeXS,
    lineHeight: 16,
    marginBottom: 2,
  },
  sourceScore: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS - 2,
  },
  legalRef: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    lineHeight: 18,
  },
  sessionPurgedBadge: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success + '33',
  },
  sessionPurgedText: {
    color: Colors.success,
    fontSize: Typography.fontSizeXS - 1,
  },
  errorBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    backgroundColor: Colors.error + '22',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '44',
  },
  errorText: { color: Colors.error, fontSize: Typography.fontSizeSM, flex: 1 },
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
