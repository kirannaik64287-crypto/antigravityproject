import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { token } = useAuth();
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => token ? { Authorization: `Bearer ${token}` } : {};

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/farms', { headers: getHeaders() });
      if (res.data?.success) {
        const farmList = res.data.data || [];
        setFarms(farmList);
        
        // Select primary farm or first farm
        if (farmList.length > 0) {
          const primary = farmList.find(f => f.isPrimary) || farmList[0];
          setSelectedFarm(prev => {
            if (prev && farmList.some(f => f.id === prev.id)) {
              return farmList.find(f => f.id === prev.id);
            }
            return primary;
          });
        } else {
          setSelectedFarm(null);
        }
      }
    } catch (err) {
      console.warn('Farms fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [token]);

  const selectFarmById = (farmId) => {
    const found = farms.find(f => f.id === farmId);
    if (found) {
      setSelectedFarm(found);
    }
  };

  const createFarm = async (farmData) => {
    try {
      const res = await axios.post('/api/farms', farmData, { headers: getHeaders() });
      if (res.data?.success) {
        await fetchFarms();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const updateFarm = async (id, farmData) => {
    try {
      const res = await axios.put(`/api/farms/${id}`, farmData, { headers: getHeaders() });
      if (res.data?.success) {
        await fetchFarms();
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const deleteFarm = async (id) => {
    try {
      const res = await axios.delete(`/api/farms/${id}`, { headers: getHeaders() });
      if (res.data?.success) {
        await fetchFarms();
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  return (
    <FarmContext.Provider value={{
      farms,
      selectedFarm,
      setSelectedFarm: selectFarmById,
      fetchFarms,
      createFarm,
      updateFarm,
      deleteFarm,
      loading
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => useContext(FarmContext);
