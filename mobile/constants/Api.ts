import { Platform } from 'react-native';

/**
 * API Configuration for Yanchi AI Backend
 *
 * - Web (browser): Uses http://localhost:8000
 * - Physical Phone via Expo Go: Uses your computer's Wi-Fi LAN IP (192.168.1.17)
 * - Android Emulator: Can use 10.0.2.2 or LAN IP
 */
export const LOCAL_DEV_IP = '192.168.1.17';

export const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/v1';
  }
  // Native mobile device (iOS / Android Expo Go)
  return `http://${LOCAL_DEV_IP}:8000/api/v1`;
};

export const API_BASE_URL = getBaseUrl();

export const Endpoints = {
  calculateWage: `${API_BASE_URL}/calculate-wage`,
  legalQA: `${API_BASE_URL}/legal-qa`,
  transcribe: `${API_BASE_URL}/transcribe`,
  synthesize: `${API_BASE_URL}/synthesize`,
  health: `${API_BASE_URL}/health`,
};
