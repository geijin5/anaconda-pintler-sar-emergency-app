import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Bell, AlertTriangle, MapPin, Info, Shield, RefreshCw } from 'lucide-react-native';
import { useEmergency } from '@/providers/emergency-provider';
import { useAuth } from '@/providers/auth-provider';
import MapView from '@/components/MapView';
import AlertBanner from '@/components/AlertBanner';
import { EmergencyZone } from '@/types/emergency';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { zones, alerts, activeAlerts, isLoading, refreshData } = useEmergency();
  const { isAuthenticated, isAdmin } = useAuth();
  const [selectedZone, setSelectedZone] = useState<EmergencyZone | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const handleZonePress = (zone: EmergencyZone) => {
    setSelectedZone(zone);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleAlertPress = () => {
    router.push('/alerts');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#DC2626';
      case 'caution':
        return '#F59E0B';
      case 'clear':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle size={16} color="#fff" />;
      case 'caution':
        return <Info size={16} color="#fff" />;
      case 'clear':
        return <Shield size={16} color="#fff" />;
      default:
        return <MapPin size={16} color="#fff" />;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading emergency data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/lky5icu2msut05pqet25n' }}
            style={styles.sarBadge}
            resizeMode="contain"
          />
          <View style={styles.headerContent}>
            <Text style={styles.title}>Emergency Status</Text>
            <Text style={styles.subtitle}>Anaconda Pintler SAR</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {!isAuthenticated ? (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin-login')}
              testID="admin-login-button"
            >
              <Shield size={24} color="#1E3A8A" />
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          ) : isAdmin ? (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin-dashboard')}
              testID="admin-dashboard-button"
            >
              <Shield size={24} color="#10B981" />
              <Text style={styles.adminButtonText}>Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin-login')}
              testID="user-admin-button"
            >
              <Shield size={24} color="#6B7280" />
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            testID="refresh-button"
          >
            <RefreshCw size={20} color="#1E3A8A" />
          </TouchableOpacity>
        </View>
      </View>

      {activeAlerts.length > 0 && (
        <AlertBanner 
          alert={activeAlerts[0]} 
          onPress={() => router.push(`/alert-details?id=${activeAlerts[0].id}`)}
        />
      )}
      
      <View style={styles.mapContainer}>
        <MapView 
          zones={zones} 
          onZonePress={handleZonePress}
          selectedZone={selectedZone}
        />
        
        <TouchableOpacity 
          style={styles.alertButton} 
          onPress={handleAlertPress}
          activeOpacity={0.9}
        >
          <Bell size={24} color="#fff" />
          {activeAlerts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeAlerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.infoPanel}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {selectedZone ? (
          <View style={styles.zoneDetails}>
            <View style={styles.zoneHeader}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedZone.status) }]}>
                {getStatusIcon(selectedZone.status)}
                <Text style={styles.statusText}>{selectedZone.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.zoneTime}>{selectedZone.updatedAt}</Text>
            </View>
            
            <Text style={styles.zoneName}>{selectedZone.name}</Text>
            <Text style={styles.zoneDescription}>{selectedZone.description}</Text>
            
            {selectedZone.instructions && (
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsTitle}>Safety Instructions:</Text>
                <Text style={styles.instructionsText}>{selectedZone.instructions}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Emergency Zone Status</Text>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#DC2626' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>Active Rescue Zone</Text>
                <Text style={styles.legendDescription}>Avoid area - Active emergency response</Text>
              </View>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>Caution Area</Text>
                <Text style={styles.legendDescription}>Use caution - Limited access</Text>
              </View>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel}>All Clear</Text>
                <Text style={styles.legendDescription}>Area is safe - Normal access</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewAlertsButton} onPress={handleAlertPress}>
              <Bell size={20} color="#fff" />
              <Text style={styles.viewAlertsText}>View All Alerts ({alerts.length})</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sarBadge: {
    width: 50,
    height: 60,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  adminButtonText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  alertButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1E3A8A',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoPanel: {
    backgroundColor: '#fff',
    maxHeight: 280,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  zoneDetails: {
    padding: 20,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  zoneTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  zoneName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  zoneDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionsBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  legendContainer: {
    padding: 20,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  legendColor: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  legendDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewAlertsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  viewAlertsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});