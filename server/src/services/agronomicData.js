/**
 * Agronomic Reference Benchmarks & Knowledge Base
 * Based on Indian Council of Agricultural Research (ICAR) and State Agricultural Universities (SAU) guidelines.
 */

export const SOIL_NUTRIENT_THRESHOLDS = {
  nitrogen: {
    unit: 'kg/ha',
    low: { max: 280, label: 'Low', status: 'Deficient', interpretation: 'Insufficient for vigorous vegetative growth. Crop will show stunted growth and pale yellowing older leaves.' },
    optimum: { min: 280, max: 560, label: 'Optimum / Medium', status: 'Adequate', interpretation: 'Ideal soil nitrogen level. Supports healthy chlorophyll synthesis and balanced shoot development.' },
    high: { min: 560, label: 'High', status: 'Excessive', interpretation: 'Excess nitrogen increases risk of crop lodging, excessive succulent foliage, delayed maturity, and susceptibility to sucking pests.' }
  },
  phosphorus: {
    unit: 'kg/ha',
    low: { max: 10, label: 'Low', status: 'Deficient', interpretation: 'Poor root proliferation and delayed flowering. Older leaves may develop dark green to purplish tints.' },
    optimum: { min: 10, max: 25, label: 'Optimum / Medium', status: 'Adequate', interpretation: 'Optimum level. Supports robust root system, timely tillering, seed formation, and early maturity.' },
    high: { min: 25, label: 'High', status: 'Excessive', interpretation: 'High phosphorus may induce micronutrient deficiencies, notably zinc (Zn) and iron (Fe).' }
  },
  potassium: {
    unit: 'kg/ha',
    low: { max: 110, label: 'Low', status: 'Deficient', interpretation: 'Weak stems, poor drought and pest tolerance. Leaf margins show scorching, chlorosis, and curling.' },
    optimum: { min: 110, max: 280, label: 'Optimum / Medium', status: 'Adequate', interpretation: 'Optimum level. Regulates stomatal opening, enzyme activation, disease resistance, and grain grain-filling.' },
    high: { min: 280, label: 'High', status: 'Excessive', interpretation: 'High potassium may interfere with uptake of magnesium (Mg) and calcium (Ca).' }
  },
  organicCarbon: {
    unit: '%',
    low: { max: 0.50, label: 'Low', status: 'Poor Organic Matter', interpretation: 'Depleted soil organic matter. Poor moisture retention, low microbial activity, and compacted soil structure.' },
    optimum: { min: 0.50, max: 0.75, label: 'Medium', status: 'Moderate', interpretation: 'Adequate biological activity and soil tilth. Maintain through regular organic amendments.' },
    high: { min: 0.75, label: 'High', status: 'Excellent', interpretation: 'Rich biological fertility, high water infiltration, excellent cation exchange capacity.' }
  },
  ph: {
    stronglyAcidic: { max: 5.5, label: 'Strongly Acidic', status: 'Acid Stress', amendment: 'Apply agricultural agricultural lime (calcium carbonate) or dolomite at 1.5 - 2.5 tonnes/ha based on buffer pH test.' },
    moderatelyAcidic: { min: 5.5, max: 6.5, label: 'Slightly to Moderately Acidic', status: 'Acceptable for most crops', amendment: 'Suitable for rice, tea, potato. Add well-rotted FYM or compost to buffer acidity.' },
    neutral: { min: 6.5, max: 7.5, label: 'Neutral (Optimal Range)', status: 'Ideal Agronomic Balance', amendment: 'No chemical amendment needed. Optimal availability for macronutrients and micronutrients.' },
    moderatelyAlkaline: { min: 7.5, max: 8.5, label: 'Moderately Alkaline', status: 'Slightly Alkaline', amendment: 'Incorporate organic matter, green manuring (dhaincha / sunnhemp), or ammonium sulfate.' },
    stronglyAlkaline: { min: 8.5, label: 'Strongly Alkaline / Sodic', status: 'Alkaline Stress', amendment: 'Apply agricultural gypsum (calcium sulfate) at 2 - 4 tonnes/ha followed by leaching with good quality irrigation water.' }
  }
};

export const CROPS_DATABASE = [
  {
    name: 'Rice (Paddy)',
    scientificName: 'Oryza sativa',
    category: 'Cereal',
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['alluvial', 'clay_loam', 'black'],
    minPh: 5.5,
    maxPh: 7.5,
    tempRange: [20, 36],
    waterRequirement: 'High (1200 - 1500 mm)',
    durationDays: '115 - 145 days',
    npkRatio: '120:60:40 kg/ha',
    irrigationMethod: 'Continuous flooding / Alternate Wetting and Drying (AWD)',
    growthStages: ['Nursery / Seedling (0-25 days)', 'Tillering (25-45 days)', 'Panicle Initiation (45-65 days)', 'Flowering / Heading (65-85 days)', 'Grain Filling & Maturation (85-125 days)'],
    precautions: 'Monitor for stem borer and blast disease. Adopt AWD to save up to 30% water.'
  },
  {
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    category: 'Cereal',
    seasons: ['Rabi'],
    soilTypes: ['alluvial', 'clay_loam', 'sandy_loam'],
    minPh: 6.0,
    maxPh: 7.5,
    tempRange: [12, 26],
    waterRequirement: 'Moderate (400 - 500 mm)',
    durationDays: '110 - 135 days',
    npkRatio: '120:60:40 kg/ha',
    irrigationMethod: 'Check basin / Sprinkler',
    growthStages: ['Crown Root Initiation (20-25 DAS)', 'Tillering (40-45 DAS)', 'Late Jointing (60-65 DAS)', 'Flowering (80-85 DAS)', 'Milking & Dough (100-115 DAS)'],
    precautions: 'First irrigation at Crown Root Initiation (CRI) stage is critical for yield. Protect against yellow rust in cool humid spells.'
  },
  {
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    category: 'Cash Crop',
    seasons: ['Kharif'],
    soilTypes: ['black', 'alluvial', 'loamy'],
    minPh: 6.5,
    maxPh: 8.2,
    tempRange: [21, 35],
    waterRequirement: 'Moderate to High (650 - 800 mm)',
    durationDays: '150 - 180 days',
    npkRatio: '120:60:60 kg/ha',
    irrigationMethod: 'Drip / Furrow',
    growthStages: ['Germination & Vegetative (0-45 DAS)', 'Squaring / Budding (45-65 DAS)', 'Flowering & Boll formation (65-110 DAS)', 'Boll bursting & Picking (110-160 DAS)'],
    precautions: 'Deep black soils are optimal. Strictly avoid waterlogging. Install pheromone traps for pink bollworm management.'
  },
  {
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    category: 'Cereal',
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['alluvial', 'sandy_loam', 'loamy', 'red'],
    minPh: 5.8,
    maxPh: 7.8,
    tempRange: [18, 33],
    waterRequirement: 'Moderate (500 - 650 mm)',
    durationDays: '90 - 110 days',
    npkRatio: '120:60:40 kg/ha',
    irrigationMethod: 'Ridge and furrow / Drip',
    growthStages: ['Seedling (0-20 DAS)', 'Knee-high vegetative (20-40 DAS)', 'Tasseling & Silking (45-60 DAS)', 'Grain filling & Dent (65-85 DAS)', 'Harvest (90-105 DAS)'],
    precautions: 'Silking and tasseling stages are highly sensitive to water stress. Scout early for Fall Armyworm (FAW).'
  },
  {
    name: 'Chickpea (Chana / Gram)',
    scientificName: 'Cicer arietinum',
    category: 'Pulse',
    seasons: ['Rabi'],
    soilTypes: ['sandy_loam', 'clay_loam', 'black'],
    minPh: 6.0,
    maxPh: 8.0,
    tempRange: [14, 28],
    waterRequirement: 'Low (250 - 350 mm)',
    durationDays: '95 - 115 days',
    npkRatio: '20:40:20 kg/ha',
    irrigationMethod: 'Sprinkler / Light furrow',
    growthStages: ['Vegetative branch formation (0-35 DAS)', 'Pre-flowering branching (35-50 DAS)', 'Pod development (50-80 DAS)', 'Maturity (85-110 DAS)'],
    precautions: 'Do not over-irrigate. Waterlogging leads to Fusarium wilt and root rot. Treat seeds with Rhizobium culture.'
  },
  {
    name: 'Soybean',
    scientificName: 'Glycine max',
    category: 'Oilseed',
    seasons: ['Kharif'],
    soilTypes: ['black', 'clay_loam', 'loamy'],
    minPh: 6.0,
    maxPh: 7.5,
    tempRange: [20, 32],
    waterRequirement: 'Moderate (450 - 600 mm)',
    durationDays: '90 - 105 days',
    npkRatio: '30:60:40 kg/ha',
    irrigationMethod: 'Broad bed and furrow (BBF) / Rainfed with protective irrigation',
    growthStages: ['Emergence & Vegetative (0-30 DAS)', 'Flowering (30-50 DAS)', 'Pod development (50-75 DAS)', 'Seed filling & Maturation (75-100 DAS)'],
    precautions: 'Inoculate with Bradyrhizobium japonicum. Ensure proper field drainage during heavy monsoon rains.'
  },
  {
    name: 'Mustard (Rapeseed)',
    scientificName: 'Brassica juncea',
    category: 'Oilseed',
    seasons: ['Rabi'],
    soilTypes: ['sandy_loam', 'alluvial', 'loamy'],
    minPh: 6.0,
    maxPh: 7.5,
    tempRange: [10, 25],
    waterRequirement: 'Low to Moderate (300 - 400 mm)',
    durationDays: '105 - 125 days',
    npkRatio: '80:40:40 kg/ha + 20 kg Sulphur',
    irrigationMethod: 'Check basin / Sprinkler',
    growthStages: ['Rosette & Vegetative (0-35 DAS)', 'Flowering (35-65 DAS)', 'Siliqua (Pod) development (65-95 DAS)', 'Maturity (95-120 DAS)'],
    precautions: 'Sulphur application (20-30 kg/ha) increases oil content significantly. Monitor for aphid infestation during cloudy weather.'
  },
  {
    name: 'Groundnut (Peanut)',
    scientificName: 'Arachis hypogaea',
    category: 'Oilseed',
    seasons: ['Kharif', 'Zaid', 'Rabi'],
    soilTypes: ['sandy_loam', 'red', 'loamy'],
    minPh: 6.0,
    maxPh: 7.2,
    tempRange: [22, 33],
    waterRequirement: 'Moderate (500 - 650 mm)',
    durationDays: '105 - 125 days',
    npkRatio: '25:50:75 kg/ha + Gypsum at 400 kg/ha',
    irrigationMethod: 'Sprinkler / Furrow',
    growthStages: ['Vegetative (0-30 DAS)', 'Flowering & Pegging (30-55 DAS)', 'Pod addition (55-85 DAS)', 'Pod maturity (85-120 DAS)'],
    precautions: 'Apply gypsum at 45 DAS (pegging stage) to promote healthy pod filling and avoid "pops" (empty shells).'
  },
  {
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    category: 'Cash Crop',
    seasons: ['Annual'],
    soilTypes: ['alluvial', 'black', 'clay_loam'],
    minPh: 6.5,
    maxPh: 8.0,
    tempRange: [20, 36],
    waterRequirement: 'Very High (1500 - 2200 mm)',
    durationDays: '300 - 365 days',
    npkRatio: '250:100:120 kg/ha',
    irrigationMethod: 'Drip irrigation with fertigation (highly recommended) / Furrow',
    growthStages: ['Germination (0-45 DAS)', 'Formative / Tillering (45-120 DAS)', 'Grand growth (120-270 DAS)', 'Ripening & Harvest (270-360 DAS)'],
    precautions: 'Trash mulching conserves moisture. Earth-up at 90 days to prevent lodging.'
  },
  {
    name: 'Pearl Millet (Bajra)',
    scientificName: 'Pennisetum glaucum',
    category: 'Millet',
    seasons: ['Kharif', 'Zaid'],
    soilTypes: ['sandy_loam', 'red', 'alluvial'],
    minPh: 6.5,
    maxPh: 8.5,
    tempRange: [24, 38],
    waterRequirement: 'Low (300 - 400 mm)',
    durationDays: '75 - 90 days',
    npkRatio: '80:40:30 kg/ha',
    irrigationMethod: 'Rainfed / 1-2 protective irrigations',
    growthStages: ['Seedling (0-15 DAS)', 'Tillering (15-35 DAS)', 'Booting & Flowering (35-55 DAS)', 'Grain filling & Maturity (55-80 DAS)'],
    precautions: 'Exceptional drought tolerance. Ideal for drylands and water-scarce regions. Avoid waterlogged soils.'
  },
  {
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'Vegetable',
    seasons: ['Kharif', 'Rabi', 'Zaid'],
    soilTypes: ['sandy_loam', 'loamy', 'alluvial', 'red'],
    minPh: 6.0,
    maxPh: 7.0,
    tempRange: [18, 30],
    waterRequirement: 'Moderate (600 - 800 mm)',
    durationDays: '90 - 130 days',
    npkRatio: '150:100:100 kg/ha',
    irrigationMethod: 'Drip with fertigation / Staked beds',
    growthStages: ['Nursery & Transplanting (0-30 days)', 'Vegetative growth (30-55 days)', 'Flowering & Fruit set (55-80 days)', 'Fruit harvesting (80-130 days)'],
    precautions: 'Stake vines to prevent fruit rotting on soil contact. Maintain regular watering to prevent blossom end rot.'
  },
  {
    name: 'Onion',
    scientificName: 'Allium cepa',
    category: 'Vegetable',
    seasons: ['Rabi', 'Kharif', 'Late Kharif'],
    soilTypes: ['sandy_loam', 'clay_loam', 'alluvial'],
    minPh: 6.0,
    maxPh: 7.5,
    tempRange: [13, 28],
    waterRequirement: 'Moderate (400 - 600 mm)',
    durationDays: '110 - 140 days',
    npkRatio: '100:50:80 kg/ha',
    irrigationMethod: 'Micro-sprinkler / Drip / Flat bed furrow',
    growthStages: ['Nursery (0-45 days)', 'Transplanting & Establishment (45-65 days)', 'Vegetative development (65-95 days)', 'Bulb initiation & Enlargement (95-130 days)', 'Curing & Harvesting'],
    precautions: 'Stop irrigation 10-15 days before harvest to ensure firm skins and extended storage life.'
  }
];

export const FERTILIZER_SOURCES = {
  nitrogen: [
    { name: 'Urea', formula: 'CO(NH2)2', content: '46% N', notes: 'Apply in 2-3 split doses to minimize leaching and volatilization loss.' },
    { name: 'Neem Coated Urea (NCU)', content: '46% N', notes: 'Slow-release; inhibits nitrification; improves nitrogen use efficiency by 10-15%.' },
    { name: 'Ammonium Sulphate', content: '20.6% N + 24% S', notes: 'Ideal for sulfur-deficient and alkaline soils.' }
  ],
  phosphorus: [
    { name: 'Di-Ammonium Phosphate (DAP)', content: '18% N, 46% P2O5', notes: 'Best applied as basal dressing placed near root zone.' },
    { name: 'Single Super Phosphate (SSP)', content: '16% P2O5, 11% S, 19% Ca', notes: 'Excellent source of phosphorus, calcium, and sulphur for oilseeds and pulses.' }
  ],
  potassium: [
    { name: 'Muriate of Potash (MOP / KCl)', content: '60% K2O', notes: 'Standard potassium source. Apply split or basal based on crop.' },
    { name: 'Sulphate of Potash (SOP / K2SO4)', content: '50% K2O, 17.5% S', notes: 'Chloride-free premium source, ideal for tobacco, potato, fruits, and vegetables.' }
  ],
  organic: [
    { name: 'Well-rotted Farmyard Manure (FYM)', content: '0.5% N, 0.2% P2O5, 0.5% K2O', application: '5 - 10 tonnes/acre incorporated 3-4 weeks before sowing.' },
    { name: 'Vermicompost', content: '1.5-2.0% N, 1.0% P2O5, 1.5% K2O', application: '1.5 - 2.5 tonnes/acre; rich in beneficial microbes and plant growth hormones.' },
    { name: 'Neem Cake', content: '5% N, 1% P, 1.5% K + Azadirachtin', application: '100 - 200 kg/acre; acts as organic nutrient source and nematode repellent.' },
    { name: 'Biofertilizers (Rhizobium / PSB / Azotobacter)', application: 'Seed treatment @ 200g per 10kg seed or soil application with FYM.' }
  ]
};
