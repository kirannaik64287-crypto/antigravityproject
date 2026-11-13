import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  History, 
  Sprout, 
  FlaskConical, 
  Sparkles, 
  Droplets, 
  Bug, 
  Eye, 
  Calendar, 
  Search, 
  X,
  Printer
} from 'lucide-react';

export const AdvisoryHistoryPage = () => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('all');
  const [history, setHistory] = useState({
    crops: [],
    soil: [],
    fertilizer: [],
    irrigation: [],
    diseases: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/history');
      if (res.data?.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.warn('History fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Advisories', count: history.crops.length + history.soil.length + history.fertilizer.length + history.irrigation.length + history.diseases.length },
    { id: 'crops', label: 'Crops', icon: Sprout, count: history.crops.length },
    { id: 'soil', label: 'Soil Health', icon: FlaskConical, count: history.soil.length },
    { id: 'fertilizer', label: 'Fertilizers', icon: Sparkles, count: history.fertilizer.length },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets, count: history.irrigation.length },
    { id: 'diseases', label: 'Disease Doctor', icon: Bug, count: history.diseases.length }
  ];

  // Aggregate items
  let records = [];
  if (activeTab === 'all' || activeTab === 'crops') {
    records.push(...history.crops.map(c => ({ ...c, _category: 'Crop Advisory', _icon: Sprout, _title: c.recommendations?.[0]?.cropName || 'Crop Recommendations' })));
  }
  if (activeTab === 'all' || activeTab === 'soil') {
    records.push(...history.soil.map(s => ({ ...s, _category: 'Soil Analysis', _icon: FlaskConical, _title: `Soil pH ${s.soilPh} Evaluation` })));
  }
  if (activeTab === 'all' || activeTab === 'fertilizer') {
    records.push(...history.fertilizer.map(f => ({ ...f, _category: 'Fertilizer Advisory', _icon: Sparkles, _title: `${f.cropName} (${f.growthStage})` })));
  }
  if (activeTab === 'all' || activeTab === 'irrigation') {
    records.push(...history.irrigation.map(i => ({ ...i, _category: 'Irrigation Plan', _icon: Droplets, _title: `${i.cropName} (${i.irrigationMethod})` })));
  }
  if (activeTab === 'all' || activeTab === 'diseases') {
    records.push(...history.diseases.map(d => ({ ...d, _category: 'Disease Scan', _icon: Bug, _title: d.suspectedDiseaseOrPest || 'Crop Health Diagnosis' })));
  }

  // Sort descending by date
  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-800 uppercase">
              Advisory Archive
            </span>
            <span className="text-xs text-stone-400">• Feature 4.12</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <History className="w-8 h-8 text-stone-700" />
            <span>Consultation & Advisory History</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Access, review, and print all previously generated crop selections, soil diagnoses, fertilizer schedules, and disease screenings.
          </p>
        </div>
      </div>

      <SafetyDisclaimer />

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* History Records List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-white rounded-2xl border border-stone-200"></div>
          <div className="h-16 bg-white rounded-2xl border border-stone-200"></div>
          <div className="h-16 bg-white rounded-2xl border border-stone-200"></div>
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-3">
          {records.map((rec) => {
            const Icon = rec._icon;
            return (
              <div
                key={rec.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/80 hover:border-emerald-300 shadow-xs transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{rec._category}</span>
                      <span className="text-[11px] text-stone-400">• {new Date(rec.createdAt).toLocaleDateString()} at {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-base">{rec._title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {rec.conditionSummary || rec.irrigationGuidance || rec.observedVisualSymptoms || rec.overallAssessment || 'Detailed advisory saved'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRecord(rec)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-end sm:self-center shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Advice</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-2">
          <History className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h3 className="font-bold text-stone-700">No Historical Advisories in this Category</h3>
          <p className="text-xs text-stone-400">Generate an advisory to view it archived here.</p>
        </div>
      )}

      {/* Inspect Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{selectedRecord._category}</span>
                <h3 className="text-xl font-extrabold text-stone-900">{selectedRecord._title}</h3>
                <p className="text-xs text-stone-400 mt-0.5">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => window.print()}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-500"
                  title="Print Advisory"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content view depending on category */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Image if available */}
              {selectedRecord.imageUrl && (
                <div className="rounded-2xl overflow-hidden aspect-video bg-stone-900 max-h-56 flex items-center justify-center">
                  <img src={selectedRecord.imageUrl} alt="Inspection" className="max-h-full object-contain" />
                </div>
              )}

              {/* Crop Recommendation detail */}
              {selectedRecord.recommendations && (
                <div className="space-y-3">
                  <h4 className="font-bold text-stone-900">Ranked Crop Recommendations:</h4>
                  {selectedRecord.recommendations.map((c, i) => (
                    <div key={i} className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="flex justify-between font-bold text-stone-900 mb-1">
                        <span>#{i + 1} {c.cropName} ({c.scientificName})</span>
                        <span className="text-emerald-700">{c.suitabilityScore} / 100 ({c.suitabilityCategory})</span>
                      </div>
                      <p className="text-stone-600 mb-1">{c.reason}</p>
                      <p className="text-[11px] text-stone-500"><strong>Precautions:</strong> {c.importantPrecautions}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Soil detail */}
              {selectedRecord.conditionSummary && (
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
                  <strong className="block text-amber-950 font-bold">Soil Condition:</strong>
                  <p className="text-amber-900">{selectedRecord.conditionSummary}</p>
                  <p className="text-stone-600 pt-1 border-t border-amber-200/50">
                    <strong>pH Assessment:</strong> {selectedRecord.phInterpretation}
                  </p>
                </div>
              )}

              {/* Fertilizer detail */}
              {selectedRecord.fertilizerSchedule && (
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900">Split Application Schedule:</h4>
                  {selectedRecord.fertilizerSchedule.map((s, i) => (
                    <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="flex justify-between font-bold text-stone-900">
                        <span>{s.stage}</span>
                        <span className="text-teal-700">{s.timing}</span>
                      </div>
                      <p className="text-emerald-900 font-semibold mt-1">{s.recommendedFertilizer}</p>
                      <p className="text-stone-500 text-xs">Method: {s.applicationMethod}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Irrigation detail */}
              {selectedRecord.irrigationGuidance && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2">
                  <strong className="block text-blue-950 font-bold">Irrigation Advice:</strong>
                  <p className="text-blue-900">{selectedRecord.irrigationGuidance}</p>
                </div>
              )}

              {/* Disease detail */}
              {selectedRecord.suspectedDiseaseOrPest && (
                <div className="space-y-3">
                  <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200/80">
                    <strong className="block text-rose-950 font-bold text-sm">Suspected: {selectedRecord.suspectedDiseaseOrPest}</strong>
                    <p className="text-xs text-rose-800 mt-1">{selectedRecord.observedVisualSymptoms}</p>
                  </div>

                  {selectedRecord.immediateActions && (
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <strong className="block text-stone-800 font-bold mb-1">Actions Taken:</strong>
                      <ul className="list-disc list-inside space-y-1 text-stone-600">
                        {selectedRecord.immediateActions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
