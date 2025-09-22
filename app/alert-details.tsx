import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Share2, 
  X,
  Navigation
} from 'lucide-react-native';
import { useEmergency } from '@/providers/emergency-provider';

export default function AlertDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { alerts } = useEmergency();
  
  const alert = alerts.find(a => a.id === id);

  if (!alert) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Alert not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        title: alert.title,
        message: `EMERGENCY ALERT: ${alert.title}\n\n${alert.message}\n\nStay safe and avoid affected areas.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
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

  return (
    <View style={styles.container}>
      <View style={[
        styles.header,
        { backgroundColor: getSeverityColor(alert.severity) }
      ]}>
        <View style={styles.headerContent}>
          <AlertTriangle size={32} color="#fff" />
          <Text style={styles.severityLabel}>{alert.severity.toUpperCase()} ALERT</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <X size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{alert.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.metaText}>{alert.timestamp}</Text>
          </View>
          {alert.location && (
            <View style={styles.metaItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.metaText}>{alert.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Alert Details</Text>
          <Text style={styles.message}>{alert.message}</Text>
        </View>

        {alert.affectedAreas && alert.affectedAreas.length > 0 && (
          <View style={styles.affectedContainer}>
            <Text style={styles.sectionTitle}>Affected Areas</Text>
            {alert.affectedAreas.map((area, index) => (
              <View key={index} style={styles.areaItem}>
                <MapPin size={16} color="#DC2626" />
                <Text style={styles.areaText}>{area}</Text>
              </View>
            ))}
          </View>
        )}

        {alert.instructions && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>Safety Instructions</Text>
            <Text style={styles.instructions}>{alert.instructions}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mapButton} onPress={() => router.back()}>
            <Navigation size={20} color="#1E3A8A" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This alert was issued by Anaconda Pintler Search and Rescue.
            For emergencies, call 911.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  affectedContainer: {
    marginBottom: 24,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 8,
  },
  areaText: {
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 24,
  },
  instructions: {
    fontSize: 15,
    color: '#78350F',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1E3A8A',
    gap: 8,
  },
  mapButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});