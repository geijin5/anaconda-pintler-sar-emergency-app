import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle, Info, CheckCircle, Clock, ChevronRight } from 'lucide-react-native';
import { useEmergency } from '@/providers/emergency-provider';
import { EmergencyAlert } from '@/types/emergency';

export default function AlertsScreen() {
  const { alerts, refreshData } = useEmergency();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#DC2626';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      case 'clear':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const iconProps = { size: 20, color: '#fff' };
    switch (severity) {
      case 'critical':
        return <AlertTriangle {...iconProps} />;
      case 'warning':
        return <Info {...iconProps} />;
      case 'clear':
        return <CheckCircle {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const handleAlertPress = (alert: EmergencyAlert) => {
    router.push(`/alert-details?id=${alert.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Emergency Alerts</Text>
          <Text style={styles.headerSubtitle}>
            {alerts.filter(a => a.isActive).length} active alerts
          </Text>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color="#10B981" />
            <Text style={styles.emptyTitle}>No Active Alerts</Text>
            <Text style={styles.emptyText}>
              All areas are currently safe. We'll notify you if any emergencies arise.
            </Text>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  !alert.isActive && styles.inactiveCard
                ]}
                onPress={() => handleAlertPress(alert)}
                activeOpacity={0.7}
              >
                <View style={styles.alertHeader}>
                  <View style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(alert.severity) }
                  ]}>
                    {getSeverityIcon(alert.severity)}
                    <Text style={styles.severityText}>
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                  {alert.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage} numberOfLines={2}>
                  {alert.message}
                </Text>

                <View style={styles.alertFooter}>
                  <View style={styles.timeContainer}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.alertTime}>{alert.timestamp}</Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))}
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  alertsList: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: 'bold',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});