-- ==============================================================================
-- AgriSahayak: AI-Powered Agriculture Crop Advisory Assistant
-- Supabase Cloud PostgreSQL Initial Schema Migration (001_initial_schema.sql)
-- Complete DDL, Row Level Security (RLS) Policies, Triggers & Reference Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS FOR TIMESTAMPS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE,
    phone TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    state TEXT,
    district TEXT,
    village TEXT,
    postal_code TEXT,
    farming_experience INTEGER DEFAULT 0, -- Years
    farming_type TEXT DEFAULT 'conventional', -- 'organic', 'conventional', 'natural', 'mixed'
    total_land_area NUMERIC(10, 2) DEFAULT 0.0,
    preferred_units TEXT NOT NULL DEFAULT 'acres', -- 'acres', 'hectares', 'guntas'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. FARMS & AGRICULTURAL PLOTS TABLE
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    village TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    total_area NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    area_unit TEXT NOT NULL DEFAULT 'acres', -- 'acres', 'hectares', 'guntas'
    soil_type TEXT NOT NULL, -- 'alluvial', 'black', 'red', 'laterite', 'sandy_loam', 'clay_loam', 'loamy'
    irrigation_source TEXT NOT NULL, -- 'borewell', 'canal', 'open_well', 'river', 'drip', 'sprinkler', 'rainfed'
    water_availability TEXT NOT NULL, -- 'abundant', 'sufficient', 'moderate', 'scarce'
    farming_method TEXT NOT NULL DEFAULT 'conventional', -- 'organic', 'conventional', 'natural_farming', 'integrated'
    current_cultivation_status TEXT NOT NULL DEFAULT 'fallow', -- 'fallow', 'standing_crop', 'harvested', 'land_preparation'
    notes TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CROP ADVISORIES TABLE
CREATE TABLE IF NOT EXISTS public.crop_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    soil_type TEXT,
    soil_ph NUMERIC(4, 2),
    nitrogen NUMERIC(8, 2),
    phosphorus NUMERIC(8, 2),
    potassium NUMERIC(8, 2),
    organic_carbon NUMERIC(5, 2),
    soil_moisture NUMERIC(5, 2),
    season TEXT,
    location TEXT,
    temperature NUMERIC(5, 2),
    rainfall NUMERIC(8, 2),
    irrigation_status TEXT,
    water_availability TEXT,
    land_area NUMERIC(10, 2),
    previous_crop TEXT,
    farming_preferences TEXT,
    expected_duration TEXT,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of ranked crops
    ai_confidence_level TEXT DEFAULT 'Moderate',
    missing_factors JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT DEFAULT 'AI-generated agricultural decision support. Verify with local Krishi Vigyan Kendra (KVK) or agricultural extension officer before field execution.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SOIL HEALTH ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.soil_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    soil_ph NUMERIC(4, 2),
    nitrogen NUMERIC(8, 2),
    phosphorus NUMERIC(8, 2),
    potassium NUMERIC(8, 2),
    organic_carbon NUMERIC(5, 2),
    soil_moisture NUMERIC(5, 2),
    soil_type TEXT,
    condition_summary TEXT,
    nutrient_interpretations JSONB NOT NULL DEFAULT '{}'::jsonb,
    deficiencies JSONB DEFAULT '[]'::jsonb,
    excesses JSONB DEFAULT '[]'::jsonb,
    ph_interpretation TEXT,
    soil_amendments JSONB DEFAULT '[]'::jsonb,
    organic_matter_advice TEXT,
    recommended_tests JSONB DEFAULT '[]'::jsonb,
    is_laboratory_verified BOOLEAN DEFAULT false,
    confidence_score NUMERIC(4, 2) DEFAULT 80.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. FERTILIZER ADVISORIES TABLE
CREATE TABLE IF NOT EXISTS public.fertilizer_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    growth_stage TEXT NOT NULL,
    soil_type TEXT,
    land_area NUMERIC(10, 2),
    area_unit TEXT DEFAULT 'acres',
    nutrient_overview JSONB NOT NULL DEFAULT '{}'::jsonb,
    fertilizer_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    application_methods JSONB DEFAULT '[]'::jsonb,
    organic_alternatives JSONB DEFAULT '[]'::jsonb,
    environmental_precautions TEXT,
    reference_standard TEXT DEFAULT 'Indian Council of Agricultural Research (ICAR) Indicative Guide',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. IRRIGATION ADVISORIES TABLE
CREATE TABLE IF NOT EXISTS public.irrigation_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    growth_stage TEXT NOT NULL,
    soil_type TEXT,
    irrigation_method TEXT,
    water_availability TEXT,
    weather_summary JSONB DEFAULT '{}'::jsonb,
    irrigation_guidance TEXT NOT NULL,
    recommended_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
    water_conservation_tips JSONB DEFAULT '[]'::jsonb,
    water_stress_indicators JSONB DEFAULT '[]'::jsonb,
    over_under_precautions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. CROP DISEASE & PEST ANALYSES TABLE (Multimodal Vision)
CREATE TABLE IF NOT EXISTS public.disease_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT,
    image_url TEXT,
    reported_symptoms TEXT,
    observed_visual_symptoms TEXT NOT NULL,
    suspected_disease_or_pest TEXT NOT NULL,
    scientific_name TEXT,
    alternative_causes JSONB DEFAULT '[]'::jsonb,
    confidence_level TEXT DEFAULT 'Preliminary',
    contributing_factors TEXT,
    immediate_actions JSONB DEFAULT '[]'::jsonb,
    preventive_measures JSONB DEFAULT '[]'::jsonb,
    expert_consultation_advised BOOLEAN DEFAULT true,
    safety_disclaimer TEXT DEFAULT 'This preliminary image screening is not a certified laboratory diagnosis. Do not mix unverified chemicals. Consult a licensed agronomist or plant pathologist.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. AI CHAT CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Agricultural Advisory Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    farm_context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. FARMING CALENDARS & TASKS
CREATE TABLE IF NOT EXISTS public.farming_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    variety TEXT,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.calendar_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES public.farming_calendars(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    description TEXT,
    crop_growth_stage TEXT,
    recommended_date DATE,
    recommended_timing TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation ensuring each authenticated farmer accesses only their data
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fertilizer_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can manage own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can manage own crop_advisories" ON public.crop_advisories;
DROP POLICY IF EXISTS "Users can manage own soil_analyses" ON public.soil_analyses;
DROP POLICY IF EXISTS "Users can manage own fertilizer_advisories" ON public.fertilizer_advisories;
DROP POLICY IF EXISTS "Users can manage own irrigation_advisories" ON public.irrigation_advisories;
DROP POLICY IF EXISTS "Users can manage own disease_analyses" ON public.disease_analyses;
DROP POLICY IF EXISTS "Users can manage own chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can manage own chat_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can manage own farming_calendars" ON public.farming_calendars;
DROP POLICY IF EXISTS "Users can manage own calendar_tasks" ON public.calendar_tasks;

-- RLS: Profiles
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS: Farms
CREATE POLICY "Users can manage own farms"
    ON public.farms FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Crop Advisories
CREATE POLICY "Users can manage own crop_advisories"
    ON public.crop_advisories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Soil Analyses
CREATE POLICY "Users can manage own soil_analyses"
    ON public.soil_analyses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Fertilizer Advisories
CREATE POLICY "Users can manage own fertilizer_advisories"
    ON public.fertilizer_advisories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Irrigation Advisories
CREATE POLICY "Users can manage own irrigation_advisories"
    ON public.irrigation_advisories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Disease Analyses
CREATE POLICY "Users can manage own disease_analyses"
    ON public.disease_analyses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Chat Conversations
CREATE POLICY "Users can manage own chat_conversations"
    ON public.chat_conversations FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Chat Messages (linked via conversation user_id)
CREATE POLICY "Users can manage own chat_messages"
    ON public.chat_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_conversations
            WHERE chat_conversations.id = chat_messages.conversation_id
            AND chat_conversations.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chat_conversations
            WHERE chat_conversations.id = chat_messages.conversation_id
            AND chat_conversations.user_id = auth.uid()
        )
    );

-- RLS: Farming Calendars
CREATE POLICY "Users can manage own farming_calendars"
    ON public.farming_calendars FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS: Calendar Tasks (linked via calendar user_id)
CREATE POLICY "Users can manage own calendar_tasks"
    ON public.calendar_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.farming_calendars
            WHERE farming_calendars.id = calendar_tasks.calendar_id
            AND farming_calendars.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.farming_calendars
            WHERE farming_calendars.id = calendar_tasks.calendar_id
            AND farming_calendars.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 13. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_advisories_user_id ON public.crop_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_advisories_farm_id ON public.crop_advisories(farm_id);
CREATE INDEX IF NOT EXISTS idx_crop_advisories_created ON public.crop_advisories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soil_analyses_user_id ON public.soil_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_fertilizer_advisories_user_id ON public.fertilizer_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_advisories_user_id ON public.irrigation_advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_user_id ON public.disease_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_farming_calendars_user_id ON public.farming_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_cal_id ON public.calendar_tasks(calendar_id);

-- ==============================================================================
-- 14. AUTH HOOK TRIGGER (Automatic Profile Creation)
-- Automatically creates a public.profiles record when a new user signs up in auth.users
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        preferred_language,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at on tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_farms_updated_at ON public.farms;
CREATE TRIGGER set_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER set_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_farming_calendars_updated_at ON public.farming_calendars;
CREATE TRIGGER set_farming_calendars_updated_at
    BEFORE UPDATE ON public.farming_calendars
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 15. REFERENCE SEED DATA: AGRONOMIC BENCHMARKS
-- Standard ICAR / SAU reference data table for crop parameters and soil thresholds
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agronomic_crop_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_name TEXT NOT NULL UNIQUE,
    scientific_name TEXT,
    crop_category TEXT NOT NULL, -- 'Cereal', 'Pulse', 'Oilseed', 'Cash Crop', 'Vegetable', 'Fruit', 'Millet'
    suitable_seasons JSONB NOT NULL DEFAULT '["Kharif"]'::jsonb,
    ideal_soil_types JSONB NOT NULL DEFAULT '["Alluvial", "Loamy"]'::jsonb,
    min_ph NUMERIC(3, 1) DEFAULT 6.0,
    max_ph NUMERIC(3, 1) DEFAULT 7.5,
    optimal_temp_min NUMERIC(4, 1) DEFAULT 20.0,
    optimal_temp_max NUMERIC(4, 1) DEFAULT 32.0,
    water_requirement_mm NUMERIC(6, 1) DEFAULT 600.0,
    growth_duration_days_min INTEGER DEFAULT 90,
    growth_duration_days_max INTEGER DEFAULT 120,
    standard_n_kg_ha NUMERIC(6, 1) DEFAULT 100.0,
    standard_p_kg_ha NUMERIC(6, 1) DEFAULT 50.0,
    standard_k_kg_ha NUMERIC(6, 1) DEFAULT 40.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed major Indian crops reference standards
INSERT INTO public.agronomic_crop_references 
(crop_name, scientific_name, crop_category, suitable_seasons, ideal_soil_types, min_ph, max_ph, optimal_temp_min, optimal_temp_max, water_requirement_mm, growth_duration_days_min, growth_duration_days_max, standard_n_kg_ha, standard_p_kg_ha, standard_k_kg_ha)
VALUES
('Rice (Paddy)', 'Oryza sativa', 'Cereal', '["Kharif", "Rabi", "Zaid"]'::jsonb, '["Clay Loam", "Alluvial", "Silty Clay"]'::jsonb, 5.5, 7.5, 22.0, 35.0, 1200.0, 110, 150, 120.0, 60.0, 40.0),
('Wheat', 'Triticum aestivum', 'Cereal', '["Rabi"]'::jsonb, '["Alluvial", "Clay Loam", "Sandy Loam"]'::jsonb, 6.0, 7.5, 12.0, 25.0, 450.0, 110, 140, 120.0, 60.0, 40.0),
('Cotton', 'Gossypium hirsutum', 'Cash Crop', '["Kharif"]'::jsonb, '["Black / Regur", "Deep Alluvial"]'::jsonb, 6.5, 8.2, 21.0, 35.0, 700.0, 150, 180, 120.0, 60.0, 60.0),
('Maize (Corn)', 'Zea mays', 'Cereal', '["Kharif", "Rabi", "Zaid"]'::jsonb, '["Well-drained Loam", "Silt Loam", "Alluvial"]'::jsonb, 5.8, 7.8, 18.0, 32.0, 500.0, 85, 110, 120.0, 60.0, 40.0),
('Sugarcane', 'Saccharum officinarum', 'Cash Crop', '["Annual"]'::jsonb, '["Deep Loam", "Black Soil", "Alluvial"]'::jsonb, 6.5, 8.0, 20.0, 35.0, 1800.0, 300, 365, 250.0, 100.0, 120.0),
('Soybean', 'Glycine max', 'Oilseed', '["Kharif"]'::jsonb, '["Black Soil", "Loamy Soil"]'::jsonb, 6.0, 7.5, 20.0, 30.0, 500.0, 90, 105, 30.0, 60.0, 40.0),
('Chickpea (Gram)', 'Cicer arietinum', 'Pulse', '["Rabi"]'::jsonb, '["Sandy Loam", "Clay Loam", "Black Soil"]'::jsonb, 6.0, 7.8, 14.0, 25.0, 300.0, 95, 115, 20.0, 40.0, 20.0),
('Mustard', 'Brassica juncea', 'Oilseed', '["Rabi"]'::jsonb, '["Sandy Loam", "Alluvial"]'::jsonb, 6.0, 7.5, 10.0, 25.0, 350.0, 100, 120, 80.0, 40.0, 40.0),
('Groundnut (Peanut)', 'Arachis hypogaea', 'Oilseed', '["Kharif", "Zaid"]'::jsonb, '["Sandy Loam", "Red Sandy Loam"]'::jsonb, 6.0, 7.0, 22.0, 30.0, 500.0, 105, 125, 25.0, 50.0, 75.0),
('Pearl Millet (Bajra)', 'Pennisetum glaucum', 'Millet', '["Kharif"]'::jsonb, '["Sandy Loam", "Light Red Soil"]'::jsonb, 6.5, 8.5, 25.0, 38.0, 350.0, 75, 90, 80.0, 40.0, 20.0)
ON CONFLICT (crop_name) DO NOTHING;
