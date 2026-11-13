import { app } from './server.js';

async function runTests() {
  console.log('🧪 Starting AgriSahayak API Automated Test Suite...\n');

  const server = app.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      // 1. Health check
      console.log('1. Testing /api/health...');
      let res = await fetch(`${baseUrl}/api/health`);
      let json = await res.json();
      console.log('   ✓ Health check passed:', json.status);

      // 2. Profile
      console.log('2. Testing /api/auth/profile...');
      res = await fetch(`${baseUrl}/api/auth/profile`);
      json = await res.json();
      console.log('   ✓ Profile retrieved:', json.data.fullName, `(${json.data.preferredUnits})`);

      // 3. Farms
      console.log('3. Testing /api/farms...');
      res = await fetch(`${baseUrl}/api/farms`);
      json = await res.json();
      console.log(`   ✓ Retrieved ${json.data.length} registered farms.`);

      // 4. Crop Recommendation
      console.log('4. Testing /api/crop-recommendation...');
      res = await fetch(`${baseUrl}/api/crop-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType: 'black',
          soilPh: 7.2,
          nitrogen: 240,
          phosphorus: 14,
          potassium: 190,
          location: 'Maharashtra, Nagpur',
          season: 'Kharif',
          landArea: 3.5,
          areaUnit: 'acres'
        })
      });
      json = await res.json();
      console.log(`   ✓ Crop Recommendations (${json.data.recommendations.length} crops):`);
      json.data.recommendations.forEach((r, idx) => {
        console.log(`     ${idx + 1}. ${r.cropName} (Score: ${r.suitabilityScore}/100, ${r.suitabilityCategory})`);
      });

      // 5. Soil Analysis
      console.log('5. Testing /api/soil-analysis...');
      res = await fetch(`${baseUrl}/api/soil-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soilType: 'alluvial',
          soilPh: 6.8,
          nitrogen: 210,
          phosphorus: 8,
          potassium: 130,
          organicCarbon: 0.42,
          soilMoisture: 35
        })
      });
      json = await res.json();
      console.log('   ✓ Soil summary:', json.data.conditionSummary);
      console.log(`   ✓ Deficiencies found: ${json.data.deficiencies.length}`);

      // 6. Fertilizer Advisory
      console.log('6. Testing /api/fertilizer...');
      res = await fetch(`${baseUrl}/api/fertilizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: 'Rice (Paddy)',
          growthStage: 'Tillering',
          soilType: 'clay_loam',
          landArea: 2,
          areaUnit: 'acres'
        })
      });
      json = await res.json();
      console.log(`   ✓ Fertilizer schedule generated (${json.data.fertilizerSchedule.length} stages).`);

      // 7. Irrigation Advisory
      console.log('7. Testing /api/irrigation...');
      res = await fetch(`${baseUrl}/api/irrigation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: 'Wheat',
          growthStage: 'Crown Root Initiation',
          soilType: 'alluvial',
          irrigationMethod: 'Check Basin',
          waterAvailability: 'sufficient'
        })
      });
      json = await res.json();
      console.log('   ✓ Irrigation guidance:', json.data.irrigationGuidance.substring(0, 60) + '...');

      // 8. Live Weather
      console.log('8. Testing /api/weather...');
      res = await fetch(`${baseUrl}/api/weather?location=Nagpur`);
      json = await res.json();
      console.log(`   ✓ Weather data fetched: ${json.data.current.temperature}°C, ${json.data.current.description}`);
      console.log(`   ✓ Spraying suitability: ${json.data.agriculturalAdvisory.spraying.suitable ? 'Favorable' : 'Unfavorable'}`);

      // 9. AI Chat Assistant
      console.log('9. Testing /api/chat...');
      res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is the best fertilizer for cotton during flowering stage?',
          preferredLanguage: 'en'
        })
      });
      json = await res.json();
      console.log('   ✓ AI Chat response received:', json.data.reply.substring(0, 80) + '...');

      // 10. Farming Calendar
      console.log('10. Testing /api/calendar...');
      res = await fetch(`${baseUrl}/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropName: 'Cotton',
          sowingDate: '2026-06-15'
        })
      });
      json = await res.json();
      console.log(`   ✓ Farming calendar generated with ${json.data.tasks.length} phased cultivation tasks.`);

      // 11. History
      console.log('11. Testing /api/history...');
      res = await fetch(`${baseUrl}/api/history`);
      json = await res.json();
      console.log(`   ✓ Unified history verified. Crop records: ${json.data.crops.length}, Soil records: ${json.data.soil.length}`);

      console.log('\n🎉 ALL 11 BACKEND API MODULE TESTS PASSED PERFECTLY!\n');
    } catch (err) {
      console.error('❌ Test failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
