import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function StealthCalculatorScreen() {
  const router = useRouter();
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [inputBuffer, setInputBuffer] = useState('');

  const unlockToYanchi = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperator(null);
    setInputBuffer('');
    router.replace('/hub');
  };

  const handlePress = (val: string) => {
    const newBuffer = (inputBuffer + val).slice(-10);
    setInputBuffer(newBuffer);

    // Secret unlock codes: 1156= (Labour Proclamation) or 2019= (Year of Proclamation)
    if (newBuffer.endsWith('1156=') || newBuffer.endsWith('2019=')) {
      unlockToYanchi();
      return;
    }

    if (val === 'C') {
      setDisplay('0');
      setPrevVal(null);
      setOperator(null);
      setResetNext(false);
      return;
    }

    if (['+', '-', '×', '÷'].includes(val)) {
      if (prevVal !== null && operator && !resetNext) {
        computeResult();
      }
      setPrevVal(parseFloat(display));
      setOperator(val);
      setResetNext(true);
      return;
    }

    if (val === '=') {
      if (prevVal !== null && operator) {
        computeResult();
        setPrevVal(null);
        setOperator(null);
        setResetNext(true);
      }
      return;
    }

    if (val === '.') {
      if (resetNext) {
        setDisplay('0.');
        setResetNext(false);
      } else if (!display.includes('.')) {
        setDisplay(display + '.');
      }
      return;
    }

    // Number input
    if (display === '0' || resetNext) {
      setDisplay(val);
      setResetNext(false);
    } else {
      if (display.length < 11) {
        setDisplay(display + val);
      }
    }
  };

  const computeResult = () => {
    const current = parseFloat(display);
    const prev = prevVal ?? 0;
    let res = 0;
    if (operator === '+') res = prev + current;
    else if (operator === '-') res = prev - current;
    else if (operator === '×') res = prev * current;
    else if (operator === '÷') res = current !== 0 ? prev / current : 0;
    setDisplay(parseFloat(res.toFixed(6)).toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEF2" />

      {/* Subtle Discreet Unlock Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.unlockBtn}
          onPress={unlockToYanchi}
          activeOpacity={0.7}
        >
          <Text style={styles.unlockBtnText}>🛡️ Return to Yanchi AI</Text>
        </TouchableOpacity>
        <Text style={styles.pinHint}>PIN: 1156=</Text>
      </View>

      <View style={styles.spacer} />

      {/* Main Display (Exact match to screenshot) */}
      <View style={styles.displayContainer}>
        <Text
          style={[
            styles.displayText,
            display.length > 8 && styles.displayTextSmall,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {display}
        </Text>
      </View>

      {/* Calculator Keypad (Exact match to screenshot) */}
      <View style={styles.keypad}>
        {/* Row 1: C, ÷, ×, - */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={() => handlePress('C')}>
            <Text style={[styles.btnText, styles.textDark]}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={() => handlePress('÷')}>
            <Text style={[styles.btnText, styles.textDark]}>÷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={() => handlePress('×')}>
            <Text style={[styles.btnText, styles.textDark]}>×</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={() => handlePress('-')}>
            <Text style={[styles.btnText, styles.textDark]}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: 7, 8, 9, + */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('7')}>
            <Text style={[styles.btnText, styles.textDark]}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('8')}>
            <Text style={[styles.btnText, styles.textDark]}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('9')}>
            <Text style={[styles.btnText, styles.textDark]}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGrey]} onPress={() => handlePress('+')}>
            <Text style={[styles.btnText, styles.textDark]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Row 3: 4, 5, 6, = */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('4')}>
            <Text style={[styles.btnText, styles.textDark]}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('5')}>
            <Text style={[styles.btnText, styles.textDark]}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('6')}>
            <Text style={[styles.btnText, styles.textDark]}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnDark]} onPress={() => handlePress('=')}>
            <Text style={[styles.btnText, styles.textWhite]}>=</Text>
          </TouchableOpacity>
        </View>

        {/* Row 4: 1, 2, 3, . */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('1')}>
            <Text style={[styles.btnText, styles.textDark]}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('2')}>
            <Text style={[styles.btnText, styles.textDark]}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('3')}>
            <Text style={[styles.btnText, styles.textDark]}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnWhite]} onPress={() => handlePress('.')}>
            <Text style={[styles.btnText, styles.textDark]}>.</Text>
          </TouchableOpacity>
        </View>

        {/* Row 5: 0 (wide) */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, styles.btnWhite, styles.btnZero]}
            onPress={() => handlePress('0')}
          >
            <Text style={[styles.btnText, styles.textDark]}>0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEEF2',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topBar: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  unlockBtn: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  unlockBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  pinHint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  spacer: {
    flex: 1,
  },
  displayContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  displayText: {
    fontSize: 72,
    fontWeight: '400',
    color: '#111827',
    textAlign: 'right',
  },
  displayTextSmall: {
    fontSize: 52,
  },
  keypad: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  btnZero: {
    flex: 0.485,
  },
  btnGrey: {
    backgroundColor: '#D1D5DC',
  },
  btnWhite: {
    backgroundColor: '#FFFFFF',
  },
  btnDark: {
    backgroundColor: '#23272F',
  },
  btnText: {
    fontSize: 26,
    fontWeight: '500',
  },
  textDark: {
    color: '#111827',
  },
  textWhite: {
    color: '#FFFFFF',
  },
});

