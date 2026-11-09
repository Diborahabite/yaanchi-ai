# Yanchi AI — Mobile Frontend

A bilingual (English / Amharic) mobile application providing legal guidance, wage & overtime calculation, and labour support under **Ethiopian Labour Proclamation No. 1156/2019**.

---

## 🎨 Theme & Design System

- **Primary Background**: Deep Burgundy (`#800020`)
- **Card Background**: Dark Charcoal (`#1E1E1E`)
- **App Canvas**: Deep Black (`#0D0D0D`)
- **Typography**: Clean white and bilingual labels (`English / አማርኛ`)
- **Global Safety Header**:
  - `Back / ተመለስ` navigation
  - `Yanchi AI` branding
  - `Quick Exit / አሸንፊደ ውጣ` instant safety exit

---

## 📱 Navigation & Screens

1. **Screen A: Mode Selection (`/app/index.tsx`)**
   - **Secure Account / የተጠበቀ መለያ**: Pseudonymous progress & saved certificates.
   - **Ghost Mode / ያለ መለያ ሁኔታ**: Zero storage, ephemeral privacy session.

2. **Screen B: Main Hub (`/app/hub.tsx`)**
   - Interactive 4-card grid:
     1. `Wage and Overtime / ደመወዝ እና ትርፍ ሰዓት` (`/wage`)
     2. `Worker Rights / የሰራተኛ መብቶች` (`/rights`)
     3. `Community Support / የማህበረሰብ ድጋፍ` (`/community`)
     4. `Voice Assistant / የድምፅ ረዳት` (`/voice`)

3. **Screen C: Wage & Overtime Calculator (`/app/wage.tsx`)**
   - Input Daily Base Salary (1.0x)
   - Input Standard Overtime Hours (1.5x, Art. 68)
   - Input Rest-Day or Holiday Hours (2.0x, Art. 69)
   - Action buttons: `Calculate Pay / ደመወዝ አስላ` & `Clear and Return / አጽዳ እና ተመለስ`
   - Detailed pay breakdown, legal limit warnings (Art. 70), and proclamation citations
   - Built-in local calculation fallback if backend API is offline

4. **Screen D: Voice Assistant (`/app/voice.tsx`)**
   - Central animated microphone button (`Speak your question in Amharic / ጥያቄዎን በአማርኛ ይናገሩ...`)
   - Quick sample questions in Amharic & keyboard typing toggle
   - Live transcript preview container
   - Interactive Audio player controls: Play, Pause, and 1.0x / 1.5x / 2.0x speed toggle
   - Proclamation No. 1156/2019 citation container with relevance scores
   - Zero-trust ephemeral memory notice with instant purge verification

5. **Screen E: Community Support (`/app/community.tsx`)**
   - Direct helpline calling (EWLA 6922, CETU, Ministry of Labour & Skills 8221, AAU Free Legal Clinic)
   - Category filtering (Legal, Union, Emergency)
   - 3-step legal dispute grievance flowchart under Art. 32

6. **Screen F: Worker Rights Guide (`/app/rights.tsx`)**
   - Reference guide covering hours, overtime, leave, maternity, forced labour prohibition, equal pay, and workplace safety.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on mobile (or iOS Simulator / Android Emulator)

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Backend Integration
The mobile app communicates with the FastAPI backend defined in `constants/Api.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8000/api/v1';
```
- If testing on physical mobile devices via Expo Go, replace `localhost` with your computer's local Wi-Fi IP address (e.g. `http://192.168.1.50:8000/api/v1`).
- The app includes automatic fallback logic: if the backend server is unreachable, the wage calculator computes pay locally using the exact same formulas.

### 4. Start the Application
```bash
npx expo start
```
- Press `w` to open in Web browser.
- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator.
- Scan the QR code with the Expo Go app on iOS/Android.

