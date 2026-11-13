import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Warehouse, 
  Plus, 
  MapPin, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Droplet, 
  SlidersHorizontal,
  X
} from 'lucide-react';

export const FarmManagement = () => {
  const { farms, selectedFarm, setSelectedFarm, createFarm, updateFarm, deleteFarm, loading } = useFarm();
  const { t } = useLanguage();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const initialForm = {
    name: '',
    state: 'Maharashtra',
    district: 'Nagpur',
    village: '',
    latitude: '',
    longitude: '',
    totalArea: 2.5,
    areaUnit: 'acres',
    soilType: 'black',
    irrigationSource: 'borewell',
    waterAvailability: 'sufficient',
    farmingMethod: 'conventional',
    currentCultivationStatus: 'standing_crop',
    notes: '',
    isPrimary: false
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      state: farm.state,
      district: farm.district,
      village: farm.village || '',
      latitude: farm.latitude || '',
      longitude: farm.longitude || '',
      totalArea: farm.totalArea,
      areaUnit: farm.areaUnit || 'acres',
      soilType: farm.soilType,
      irrigationSource: farm.irrigationSource,
      waterAvailability: farm.waterAvailability,
      farmingMethod: farm.farmingMethod,
      currentCultivationStatus: farm.currentCultivationStatus,
      notes: farm.notes || '',
      isPrimary: farm.isPrimary || false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingFarm) {
      await updateFarm(editingFarm.id, formData);
    } else {
      await createFarm(formData);
    }

    setSubmitting(false);
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this farm plot?')) {
      await deleteFarm(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase">
              Field Registry
            </span>
            <span className="text-xs text-stone-400">• Feature 4.3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Warehouse className="w-8 h-8 text-emerald-600" />
            <span>Farm & Agricultural Plot Management</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Register and manage multiple agricultural plots with individual soil types, water sources, and acreage.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Plot</span>
        </button>
      </div>

      {/* Farms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {farms.map((farm) => {
          const isSelected = selectedFarm?.id === farm.id;
          return (
            <div
              key={farm.id}
              className={`bg-white rounded-3xl p-5 border transition-all relative flex flex-col justify-between ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-stone-200/80 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize">
                      {farm.farmingMethod}
                    </span>
                    {farm.isPrimary && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(farm)}
                      className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-800 transition"
                      title="Edit Farm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(farm.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-stone-400 hover:text-rose-600 transition"
                      title="Delete Farm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-stone-900 text-lg mb-1">{farm.name}</h3>
                <p className="text-xs text-stone-500 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{farm.village ? `${farm.village}, ` : ''}{farm.district}, {farm.state}</span>
                </p>

                {/* Plot metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block font-medium">Acreage</span>
                    <span className="font-bold text-stone-800 text-sm">{farm.totalArea} {farm.areaUnit || 'acres'}</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block font-medium">Soil</span>
                    <span className="font-bold text-stone-800 capitalize text-sm">{farm.soilType?.replace('_', ' ')}</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block font-medium">Water Source</span>
                    <span className="font-bold text-stone-800 capitalize text-sm">{farm.irrigationSource}</span>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block font-medium">Status</span>
                    <span className="font-bold text-stone-800 capitalize text-sm">{farm.currentCultivationStatus?.replace('_', ' ')}</span>
                  </div>
                </div>

                {farm.notes && (
                  <p className="text-xs text-stone-500 italic mb-4 line-clamp-2">"{farm.notes}"</p>
                )}
              </div>

              {/* Set Active Button */}
              <button
                type="button"
                onClick={() => setSelectedFarm(farm.id)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Active Selected Plot</span>
                  </>
                ) : (
                  <span>Set as Active Plot</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {editingFarm ? 'Edit Farm Plot' : 'Register New Farm Plot'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Plot Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. North Canal Field"
                  className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">District *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Village</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Total Land Area *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={formData.totalArea}
                    onChange={(e) => setFormData({ ...formData, totalArea: parseFloat(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Measurement Unit *</label>
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="guntas">Guntas (Guntha)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type *</label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="alluvial">Alluvial</option>
                    <option value="black">Black / Regur</option>
                    <option value="red">Red Soil</option>
                    <option value="laterite">Laterite</option>
                    <option value="sandy_loam">Sandy Loam</option>
                    <option value="clay_loam">Clay Loam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Irrigation Source *</label>
                  <select
                    value={formData.irrigationSource}
                    onChange={(e) => setFormData({ ...formData, irrigationSource: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="borewell">Borewell</option>
                    <option value="canal">Canal</option>
                    <option value="open_well">Open Well</option>
                    <option value="river">River Lift</option>
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler</option>
                    <option value="rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Farming Method</label>
                  <select
                    value={formData.farmingMethod}
                    onChange={(e) => setFormData({ ...formData, farmingMethod: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="conventional">Conventional</option>
                    <option value="organic">Organic</option>
                    <option value="natural_farming">ZBNF / Natural</option>
                    <option value="integrated">Integrated (IPM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Current Status</label>
                  <select
                    value={formData.currentCultivationStatus}
                    onChange={(e) => setFormData({ ...formData, currentCultivationStatus: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                  >
                    <option value="standing_crop">Standing Crop</option>
                    <option value="fallow">Fallow / Rest</option>
                    <option value="land_preparation">Land Preparation</option>
                    <option value="harvested">Recently Harvested</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional field notes, drainage conditions, landmarks..."
                  className="w-full rounded-xl border border-stone-300 p-2.5 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryCheck"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300"
                />
                <label htmlFor="isPrimaryCheck" className="text-xs text-stone-700 cursor-pointer">
                  Set as primary / default farm plot
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingFarm ? 'Save Changes' : 'Register Plot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
