# 🧙 Sage Predictor - Football Prediction App

**Tagline:** "Wise Betting, Smart Profits"

## Features
- 7-day match predictions
- All major betting markets (FT, DC, O/U, BTTS, Correct Score, etc.)
- 10 top leagues supported
- Confidence-based filtering
- Safety scores for each match

## Setup Instructions

### 1. Get API Key
1. Visit https://www.football-data.org/
2. Register for a FREE account
3. Copy your API key

### 2. Install the App
1. Download the APK from GitHub Actions artifacts
2. Install on your Android device
3. Open the app

### 3. Configure
1. Tap "SETTINGS" button
2. Paste your API key
3. Tap "Save"
4. Go to "HOME" to view predictions

## Supported Leagues
- Premier League
- La Liga
- Bundesliga
- Serie A
- Ligue 1
- Eredivisie
- Primeira Liga
- Championship
- Champions League
- Europa League

## Build Instructions

### GitHub Actions (Automatic)
1. Push code to main/master branch
2. GitHub Actions will automatically build APK
3. Download from Actions → Artifacts

### Local Build
```bash
npm install --legacy-peer-deps
cd android

./gradlew assembleRelease
