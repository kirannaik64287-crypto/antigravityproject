# 🌾 AgriSahayak: AI-Powered Agriculture Crop Advisory Assistant

> **AgriSahayak** is an elite, production-grade agricultural decision-support platform designed to empower small, medium, and large-scale farmers with personalized, data-informed agronomic advice throughout the crop cultivation lifecycle.

Powered by **Google Gemini 2.5 Flash** (via the official `@google/genai` SDK), **Supabase Cloud PostgreSQL** with Row-Level Security (RLS), real-time high-resolution agricultural meteorological models (**Open-Meteo & OpenWeather**), and verified **ICAR (Indian Council of Agricultural Research)** reference standards.

---

## 🌟 Key Capabilities & Mandatory Features

1. **Authentication & User Management (Feature 4.1)**:
   - Supabase Authentication with session persistence.
   - Individual farmer agricultural profiles, language preference, and unit settings.
2. **Farmer Profile Management (Feature 4.2)**:
   - Name, phone, state, district, village, farming experience, and farming types.
   - Native support for Indian agricultural measurement units: **Acres**, **Hectares**, and **Guntas**.
3. **Farm & Field Management (Feature 4.3)**:
   - Multi-plot registry with soil texture, water availability, irrigation method, and cultivation status.
   - One-click farm context linking across all advisory modules.
4. **AI-Powered Crop Recommendation (Feature 4.4)**:
   - Evaluates soil pH, NPK, organic carbon, moisture, season, climate, and water availability.
   - Generates ranked crop recommendations with 0–100 suitability scores, compatibility breakdowns, duration, precautions, and confidence levels.
5. **Soil Health Interpretation & Fertility Analysis (Feature 4.5)**:
   - Compares soil chemistry against ICAR agronomic reference thresholds.
   - Diagnoses deficiencies, excesses, soil pH stresses, lime/gypsum dosage calculations, and organic matter practices.
6. **Fertilizer Recommendation System (Feature 4.6)**:
   - Crop and growth-stage-specific split application timetable (Basal, Tillering, Flowering, Grain filling).
   - Commercial formulations (DAP, Urea, MOP, SSP) and organic alternatives (FYM, Vermicompost, Biofertilizers).
   - Strict warnings against excessive nitrogen and environmental contamination.
7. **Weather-Aware Irrigation Scheduling (Feature 4.7)**:
   - Combines soil type, crop stage, and live precipitation forecasts to determine irrigation intervals and depths.
   - Water conservation practices (AWD, mulching, alternate furrow) and drought stress indicators.
8. **Crop Disease & Pest Identification (Multimodal Vision) (Feature 4.8)**:
   - Multimodal Gemini image screening of crop leaves, stems, and pests.
   - Visual symptom descriptions, suspected pathogens with scientific names, differential diagnoses, immediate organic remedies, and KVK consultation advisories.
9. **Weather-Aware Agricultural Station (Feature 4.9)**:
   - Real-time temperature, humidity, wind vectors, and rainfall from Open-Meteo (no API key required).
   - 7-day agricultural forecasts with **Spraying Suitability**, **Sowing Readiness**, and **Irrigation Need** indices.
10. **AI Agricultural Chat Assistant (Feature 4.10)**:
    - Conversational assistant maintaining farm profile context in English, Hindi, Punjabi, Marathi, and Telugu.
    - Integrated browser speech synthesis (Text-to-Speech) for accessibility.
11. **Farming Operations Calendar (Feature 4.11)**:
    - Crop-specific cultivation roadmap from pre-sowing soil solarization to harvest.
    - Interactive task completion tracker persisted in the database.
12. **Unified Advisory History (Feature 4.12)**:
    - Centralized archive to revisit, inspect, and print previous advisories.

---

## 🏗️ Architecture & Technology Stack

```
agrisahayak/
├── client/                     # Modern React.js (Vite + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, BottomNav, FarmSelector, WeatherWidget, Safety
│   │   ├── context/            # LanguageContext, AuthContext, FarmContext
│   │   ├── pages/              # 12 Full-feature pages (Dashboard, Crop, Soil, Disease, etc.)
│   │   └── translations.js     # Multilingual dictionaries (EN, HI, PA, MR, TE)
│   └── dist/                   # Production-compiled bundle served by Express
├── server/                     # Node.js + Express.js REST API
│   ├── src/
│   │   ├── config/             # Gemini (@google/genai), Supabase, Environment
│   │   ├── middleware/         # Auth verification, Zod schema validation, Error handler
│   │   ├── routes/             # REST endpoints (/api/crops, /api/soil, /api/weather, etc.)
│   │   ├── schemas/            # Strict Zod validation schemas
│   │   └── services/           # GeminiService, WeatherService, SupabaseService, AgronomicData
│   └── uploads/                # Local cache for uploaded crop diagnostic photos
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Complete DDL, RLS policies, triggers, and seed data
│   └── apply-migrations.js     # Node.js automated migration runner script
└── package.json                # Unified workspace scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm**

### 2. Environment Configuration
Copy `.env.example` to `server/.env` (or project root `.env`):

```bash
# Server Port
PORT=5000
CLIENT_URL=http://localhost:5173

# Google Gemini AI Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Supabase Cloud PostgreSQL
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Supabase Direct PostgreSQL Connection (For migration runner)
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Weather API (Optional - Open-Meteo works out-of-the-box without key!)
OPENWEATHER_API_KEY=
```

### 3. Database Migration
To apply all tables, Row Level Security (RLS) policies, triggers, and agronomic seed data to your Supabase Cloud PostgreSQL database:

```bash
# Run migration runner script:
node supabase/apply-migrations.js
```
*(Alternatively, copy the contents of `supabase/migrations/001_initial_schema.sql` directly into your Supabase Dashboard SQL Editor and click **Run**).*

### 4. Running the Application

```bash
# Option A: Start the unified production server (serves API + React frontend):
cd server && npm start

# Option B: Run development mode with hot reload:
# Terminal 1 (Backend):
cd server && npm run dev

# Terminal 2 (Frontend):
cd client && npm run dev
```

Visit **http://localhost:5000** (or **http://localhost:5173** in dev mode) in your browser.

---

## 🧪 Automated Testing

AgriSahayak includes an automated backend test suite verifying all 11 API endpoints:

```bash
node server/src/test-api.js
```

---

## 🛡️ Agricultural Safety & Decision Support Disclaimer
AgriSahayak provides artificial intelligence-assisted decision-support recommendations based on agronomic models and ICAR reference guidelines. Recommendations do not constitute certified biological or legal guarantees. Farmers must verify chemical diagnoses and dosages with local **Krishi Vigyan Kendra (KVK)** or licensed agricultural extension officers before field application.
