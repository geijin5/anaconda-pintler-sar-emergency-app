import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { EmergencyZone, EmergencyAlert } from '@/types/emergency';
import { mockZones, mockAlerts } from '@/mocks/emergency-data';

interface EmergencyContextType {
  zones: EmergencyZone[];
  alerts: EmergencyAlert[];
  activeAlerts: EmergencyAlert[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateZone: (zone: EmergencyZone) => void;
  addZone: (zone: Omit<EmergencyZone, 'id' | 'updatedAt'>) => void;
  clearZone: (zoneId: string) => void;
  deleteZone: (zoneId: string) => void;
  addAlert: (alert: EmergencyAlert) => void;
  clearAlert: (alertId: string) => void;
  updateAlert: (alert: EmergencyAlert) => void;
}

const STORAGE_KEYS = {
  ZONES: '@emergency_zones',
  ALERTS: '@emergency_alerts',
  LAST_SYNC: '@last_sync',
};

export const [EmergencyProvider, useEmergency] = createContextHook<EmergencyContextType>(() => {
  const [zones, setZones] = useState<EmergencyZone[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const saveToCache = useCallback(async (zonesData: EmergencyZone[], alertsData: EmergencyAlert[]) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zonesData)),
        AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alertsData)),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString()),
      ]);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  const loadCachedData = useCallback(async () => {
    try {
      const [cachedZones, cachedAlerts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ZONES),
        AsyncStorage.getItem(STORAGE_KEYS.ALERTS),
      ]);

      if (cachedZones) {
        setZones(JSON.parse(cachedZones));
      }
      if (cachedAlerts) {
        setAlerts(JSON.parse(cachedAlerts));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setZones(mockZones);
      setAlerts(mockAlerts);
      await saveToCache(mockZones, mockAlerts);
    } catch (error) {
      console.error('Error refreshing data:', error);
      await loadCachedData();
    } finally {
      setIsLoading(false);
    }
  }, [saveToCache, loadCachedData]);

  const updateZone = useCallback((updatedZone: EmergencyZone) => {
    setZones(currentZones => {
      const newZones = currentZones.map(zone => 
        zone.id === updatedZone.id ? updatedZone : zone
      );
      saveToCache(newZones, alerts);
      return newZones;
    });
  }, [alerts, saveToCache]);

  const addZone = useCallback((zoneData: Omit<EmergencyZone, 'id' | 'updatedAt'>) => {
    const newZone: EmergencyZone = {
      ...zoneData,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString(),
    };
    
    setZones(currentZones => {
      const newZones = [newZone, ...currentZones];
      saveToCache(newZones, alerts);
      return newZones;
    });
  }, [alerts, saveToCache]);

  const clearZone = useCallback((zoneId: string) => {
    setZones(currentZones => {
      const newZones = currentZones.map(zone => 
        zone.id === zoneId ? { ...zone, status: 'clear' as const, updatedAt: new Date().toISOString() } : zone
      );
      saveToCache(newZones, alerts);
      return newZones;
    });
  }, [alerts, saveToCache]);

  const deleteZone = useCallback((zoneId: string) => {
    setZones(currentZones => {
      const newZones = currentZones.filter(zone => zone.id !== zoneId);
      saveToCache(newZones, alerts);
      return newZones;
    });
  }, [alerts, saveToCache]);

  const addAlert = useCallback((newAlert: EmergencyAlert) => {
    setAlerts(currentAlerts => {
      const newAlerts = [newAlert, ...currentAlerts];
      saveToCache(zones, newAlerts);
      return newAlerts;
    });
  }, [zones, saveToCache]);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(currentAlerts => {
      const updatedAlerts = currentAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isActive: false } : alert
      );
      saveToCache(zones, updatedAlerts);
      return updatedAlerts;
    });
  }, [zones, saveToCache]);

  const updateAlert = useCallback((updatedAlert: EmergencyAlert) => {
    setAlerts(currentAlerts => {
      const newAlerts = currentAlerts.map(alert => 
        alert.id === updatedAlert.id ? updatedAlert : alert
      );
      saveToCache(zones, newAlerts);
      return newAlerts;
    });
  }, [zones, saveToCache]);

  const activeAlerts = useMemo(() => alerts.filter(alert => alert.isActive), [alerts]);

  useEffect(() => {
    const initializeData = async () => {
      await loadCachedData();
      await refreshData();
    };
    initializeData();
  }, []);

  return useMemo(() => ({
    zones,
    alerts,
    activeAlerts,
    isLoading,
    refreshData,
    updateZone,
    addZone,
    clearZone,
    deleteZone,
    addAlert,
    clearAlert,
    updateAlert,
  }), [zones, alerts, activeAlerts, isLoading, refreshData, updateZone, addZone, clearZone, deleteZone, addAlert, clearAlert, updateAlert]);
});