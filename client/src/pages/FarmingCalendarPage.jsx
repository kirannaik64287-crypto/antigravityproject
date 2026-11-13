import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { 
  CalendarDays, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  Filter
} from 'lucide-react';

export const FarmingCalendarPage = () => {
  const { selectedFarm } = useFarm();
  const { t } = useLanguage();

  const [calendars, setCalendars] = useState([]);
  const [activeCalendar, setActiveCalendar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  // New calendar form
  const [cropName, setCropName] = useState('Cotton');
  const [sowingDate, setSowingDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/calendar');
      if (res.data?.success) {
        const list = res.data.data || [];
        setCalendars(list);
        if (list.length > 0) {
          setActiveCalendar(list[0]);
        }
      }
    } catch (err) {
      console.warn('Calendar fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await axios.post('/api/calendar', {
        cropName,
        sowingDate,
        farmId: selectedFarm?.id || null
      });

      if (res.data?.success) {
        setCalendars(prev => [res.data.data, ...prev]);
        setActiveCalendar(res.data.data);
        setShowNewModal(false);
      }
    } catch (err) {
      console.error('Error creating calendar:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    if (!activeCalendar) return;

    try {
      // Optimistic update
      const updatedTasks = activeCalendar.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, isCompleted: !currentCompleted, completedAt: !currentCompleted ? new Date().toISOString() : null };
        }
        return t;
      });

      setActiveCalendar({ ...activeCalendar, tasks: updatedTasks });

      await axios.patch(`/api/calendar/${activeCalendar.id}/tasks/${taskId}`, {
        isCompleted: !currentCompleted
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      fetchCalendars(); // revert on error
    }
  };

  const completedCount = activeCalendar?.tasks?.filter(t => t.isCompleted).length || 0;
  const totalTasks = activeCalendar?.tasks?.length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase">
              Field Operations
            </span>
            <span className="text-xs text-stone-400">• Feature 4.11</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-8 h-8 text-purple-600" />
            <span>Farming Operations Calendar & Milestone Tracker</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Step-by-step agricultural timeline from land solarization to harvest with interactive activity checklists.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Crop Roadmap</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Calendars Switcher */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider px-2">
            Active Cultivation Cycles ({calendars.length})
          </h2>

          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-16 bg-white rounded-2xl border border-stone-200"></div>
              <div className="h-16 bg-white rounded-2xl border border-stone-200"></div>
            </div>
          ) : calendars.length > 0 ? (
            <div className="space-y-2">
              {calendars.map((cal) => (
                <div
                  key={cal.id}
                  onClick={() => setActiveCalendar(cal)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    activeCalendar?.id === cal.id
                      ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-purple-200'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{cal.cropName}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Sown: {cal.sowingDate} • Harvest: {cal.expectedHarvestDate || 'In ~120 days'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center text-xs text-stone-500">
              No crop calendars created yet.
            </div>
          )}
        </div>

        {/* Right: Timeline Checklist */}
        <div className="lg:col-span-8">
          {activeCalendar ? (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-xs space-y-6">
              {/* Cycle Overview Banner */}
              <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-5">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold text-purple-200 uppercase">Crop Lifecycle Tracker</span>
                    <h2 className="text-xl sm:text-2xl font-black">{activeCalendar.cropName} Cultivation</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-purple-200">Progress</span>
                    <p className="text-lg font-bold">{completedCount} of {totalTasks} Completed ({progressPercent}%)</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Phased Activity Milestones */}
              <div className="space-y-3">
                <h3 className="font-bold text-stone-900 text-sm">Actionable Cultivation Tasks</h3>

                <div className="space-y-2.5">
                  {activeCalendar.tasks?.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.isCompleted)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                        task.isCompleted 
                          ? 'bg-emerald-50/50 border-emerald-200 text-stone-500' 
                          : 'bg-white border-stone-200 hover:border-purple-300'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-stone-400 hover:text-emerald-600 transition shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`text-sm font-bold ${task.isCompleted ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                            {task.activityName}
                          </h4>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            {task.recommendedTiming || task.cropGrowthStage}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                        {task.recommendedDate && (
                          <span className="text-[10px] text-purple-700 font-semibold block mt-1">
                            Target Date: {task.recommendedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-3">
              <CalendarDays className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-stone-600 font-bold">Select or generate a crop calendar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Generate New Calendar */}
      {showNewModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Generate Farming Calendar</h3>
            <p className="text-xs text-stone-500">
              Provide crop and sowing date. AgriSahayak will schedule land preparation, nutrient timings, and harvest dates.
            </p>

            <form onSubmit={handleCreateCalendar} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Crop *</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Cotton, Wheat, Paddy, Mustard"
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 p-2.5 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sowing Date *</label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full text-xs sm:text-sm rounded-xl border border-stone-300 p-2.5 bg-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 disabled:opacity-50"
                >
                  {generating ? 'Scheduling...' : 'Generate Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
