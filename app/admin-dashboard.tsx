import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Plus,
  AlertTriangle,
  MapPin,
  Users,
  LogOut,
  Send,
  Trash2,
  ArrowLeft,
  Shield,
  Settings,
  Key,
} from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useEmergency } from '@/providers/emergency-provider';
import { EmergencyAlert, AlertSeverity, EmergencyZone } from '@/types/emergency';

type CreateAlertModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (alert: Omit<EmergencyAlert, 'id' | 'timestamp'>) => void;
};

type CreateZoneModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (zone: Omit<EmergencyZone, 'id' | 'updatedAt'>) => void;
};

type AdminSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpdateCredentials: (username: string, password: string) => Promise<boolean>;
};

function CreateAlertModal({ visible, onClose, onSubmit }: CreateAlertModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('medium');
  const [isActive, setIsActive] = useState(true);
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onSubmit({
      title: title.trim(),
      message: message.trim(),
      severity,
      isActive,
      location: location.trim() || undefined,
    });

    // Reset form
    setTitle('');
    setMessage('');
    setSeverity('medium');
    setIsActive(true);
    setLocation('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Alert</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.modalSubmitText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Alert title"
              testID="alert-title-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Alert message"
              multiline
              numberOfLines={4}
              testID="alert-message-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Specific location (optional)"
              testID="alert-location-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Severity</Text>
            <View style={styles.severityButtons}>
              {(['low', 'medium', 'high', 'critical'] as AlertSeverity[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    severity === level && styles.severityButtonActive,
                    { backgroundColor: getSeverityColor(level) + '20' },
                  ]}
                  onPress={() => setSeverity(level)}
                  testID={`severity-${level}`}
                >
                  <Text
                    style={[
                      styles.severityButtonText,
                      severity === level && { color: getSeverityColor(level) },
                    ]}
                  >
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.inputLabel}>Active Alert</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
                thumbColor={isActive ? '#FFFFFF' : '#F3F4F6'}
                testID="alert-active-switch"
              />
            </View>
            <Text style={styles.switchDescription}>
              Active alerts will be sent as push notifications
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function AdminSettingsModal({ visible, onClose, onUpdateCredentials }: AdminSettingsModalProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsUpdating(true);
    try {
      const success = await onUpdateCredentials(newUsername.trim(), newPassword);
      if (success) {
        Alert.alert('Success', 'Admin credentials updated successfully!');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update credentials. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Admin Settings</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isUpdating}>
            <Text style={[styles.modalSubmitText, isUpdating && { opacity: 0.5 }]}>
              {isUpdating ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.settingsSection}>
            <View style={styles.settingsHeader}>
              <Key size={24} color="#1E3A8A" />
              <Text style={styles.settingsSectionTitle}>Change Login Credentials</Text>
            </View>
            <Text style={styles.settingsDescription}>
              Update your admin username and password. You will need to use these new credentials for future logins.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Username *</Text>
            <TextInput
              style={styles.textInput}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter new username"
              autoCapitalize="none"
              testID="new-username-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password *</Text>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password (min 6 characters)"
              secureTextEntry
              testID="new-password-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
              testID="confirm-password-input"
            />
          </View>

          <View style={styles.warningBox}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              Warning: After updating your credentials, you will need to log in again with the new username and password.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CreateZoneModal({ visible, onClose, onSubmit }: CreateZoneModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<'active' | 'caution' | 'clear'>('active');
  const [x, setX] = useState('0.5');
  const [y, setY] = useState('0.5');
  const [radius, setRadius] = useState('50');

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const xNum = parseFloat(x);
    const yNum = parseFloat(y);
    const radiusNum = parseInt(radius);

    if (isNaN(xNum) || isNaN(yNum) || isNaN(radiusNum) || xNum < 0 || xNum > 1 || yNum < 0 || yNum > 1) {
      Alert.alert('Error', 'Please enter valid coordinates (0-1) and radius');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim() || undefined,
      status,
      coordinates: { x: xNum, y: yNum },
      radius: radiusNum,
    });

    // Reset form
    setName('');
    setDescription('');
    setInstructions('');
    setStatus('active');
    setX('0.5');
    setY('0.5');
    setRadius('50');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Zone</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.modalSubmitText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Zone Name *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Zone name"
              testID="zone-name-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Zone description"
              multiline
              numberOfLines={3}
              testID="zone-description-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Instructions</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Instructions for this zone (optional)"
              multiline
              numberOfLines={3}
              testID="zone-instructions-input"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.statusButtons}>
              {(['active', 'caution', 'clear'] as const).map((statusOption) => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusButton,
                    status === statusOption && styles.statusButtonActive,
                    { backgroundColor: getZoneStatusColor(statusOption) + '20' },
                  ]}
                  onPress={() => setStatus(statusOption)}
                  testID={`status-${statusOption}`}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === statusOption && { color: getZoneStatusColor(statusOption) },
                    ]}
                  >
                    {statusOption.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.coordinatesRow}>
            <View style={styles.coordinateInput}>
              <Text style={styles.inputLabel}>X Position (0-1)</Text>
              <TextInput
                style={styles.textInput}
                value={x}
                onChangeText={setX}
                placeholder="0.5"
                keyboardType="decimal-pad"
                testID="zone-x-input"
              />
            </View>
            <View style={styles.coordinateInput}>
              <Text style={styles.inputLabel}>Y Position (0-1)</Text>
              <TextInput
                style={styles.textInput}
                value={y}
                onChangeText={setY}
                placeholder="0.5"
                keyboardType="decimal-pad"
                testID="zone-y-input"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Radius (pixels)</Text>
            <TextInput
              style={styles.textInput}
              value={radius}
              onChangeText={setRadius}
              placeholder="50"
              keyboardType="number-pad"
              testID="zone-radius-input"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'low': return '#10B981';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
    case 'critical': return '#DC2626';
    default: return '#6B7280';
  }
}

function getZoneStatusColor(status: 'active' | 'caution' | 'clear'): string {
  switch (status) {
    case 'active': return '#DC2626';
    case 'caution': return '#F59E0B';
    case 'clear': return '#10B981';
    default: return '#6B7280';
  }
}

export default function AdminDashboard() {
  const { user, logout, isAuthenticated, isAdmin, updateCredentials } = useAuth();
  const { alerts, zones, addAlert, activeAlerts, clearAlert, addZone, clearZone, deleteZone } = useEmergency();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.replace('/');
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleCreateAlert = (alertData: Omit<EmergencyAlert, 'id' | 'timestamp'>) => {
    const newAlert: EmergencyAlert = {
      ...alertData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    addAlert(newAlert);
    Alert.alert('Success', 'Alert created successfully!');
  };

  const handleCreateZone = (zoneData: Omit<EmergencyZone, 'id' | 'updatedAt'>) => {
    addZone(zoneData);
    Alert.alert('Success', 'Emergency zone created successfully!');
  };

  const handleSendNotification = (alert: EmergencyAlert) => {
    Alert.alert(
      'Send Notification',
      `Send push notification for "${alert.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // In production, this would trigger actual push notifications
            Alert.alert('Sent', 'Push notification sent to all users!');
          },
        },
      ]
    );
  };

  const handleClearAlert = (alert: EmergencyAlert) => {
    Alert.alert(
      'Clear Alert',
      `Are you sure you want to clear "${alert.title}"? This will deactivate the alert.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Alert',
          style: 'destructive',
          onPress: () => {
            clearAlert(alert.id);
            Alert.alert('Success', 'Alert has been cleared successfully!');
          },
        },
      ]
    );
  };

  const handleClearZone = (zone: EmergencyZone) => {
    Alert.alert(
      'Clear Zone',
      `Are you sure you want to clear "${zone.name}"? This will mark the zone as safe.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Zone',
          onPress: () => {
            clearZone(zone.id);
            Alert.alert('Success', 'Zone has been cleared successfully!');
          },
        },
      ]
    );
  };

  const handleDeleteZone = (zone: EmergencyZone) => {
    Alert.alert(
      'Delete Zone',
      `Are you sure you want to permanently delete "${zone.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteZone(zone.id);
            Alert.alert('Success', 'Zone has been deleted successfully!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={20} color="#1E3A8A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user?.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsModal(true)}
              testID="settings-button"
            >
              <Settings size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              testID="logout-button"
            >
              <LogOut size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.statNumber}>{activeAlerts.length}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
          <View style={styles.statCard}>
            <MapPin size={24} color="#1E3A8A" />
            <Text style={styles.statNumber}>{zones.length}</Text>
            <Text style={styles.statLabel}>Emergency Zones</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#10B981" />
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>App Users</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCreateModal(true)}
              testID="create-alert-button"
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Create Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => setShowCreateZoneModal(true)}
              testID="create-zone-button"
            >
              <Shield size={20} color="#1E3A8A" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Create Zone
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Zones</Text>
          {zones.map((zone) => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneTitle}>{zone.name}</Text>
                  <Text style={styles.zoneTime}>
                    Updated {zone.updatedAt}
                  </Text>
                </View>
                <View style={styles.zoneActions}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getZoneStatusColor(zone.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {zone.status.toUpperCase()}
                    </Text>
                  </View>
                  {zone.status !== 'clear' && (
                    <TouchableOpacity
                      style={styles.clearZoneButton}
                      onPress={() => handleClearZone(zone)}
                      testID={`clear-zone-${zone.id}`}
                    >
                      <Shield size={16} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.deleteZoneButton}
                    onPress={() => handleDeleteZone(zone)}
                    testID={`delete-zone-${zone.id}`}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.zoneDescription} numberOfLines={2}>
                {zone.description}
              </Text>
              <Text style={styles.zoneCoordinates}>
                📍 Position: ({zone.coordinates.x.toFixed(2)}, {zone.coordinates.y.toFixed(2)}) • Radius: {zone.radius}px
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {alerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.alertActions}>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(alert.severity) },
                    ]}
                  >
                    <Text style={styles.severityText}>
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                  {alert.isActive ? (
                    <View style={styles.activeAlertActions}>
                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={() => handleSendNotification(alert)}
                        testID={`send-notification-${alert.id}`}
                      >
                        <Send size={16} color="#1E3A8A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => handleClearAlert(alert)}
                        testID={`clear-alert-${alert.id}`}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.clearedBadge}>
                      <Text style={styles.clearedText}>CLEARED</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.alertMessage} numberOfLines={2}>
                {alert.message}
              </Text>
              {alert.location && (
                <Text style={styles.alertLocation}>📍 {alert.location}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <CreateAlertModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAlert}
      />
      
      <CreateZoneModal
        visible={showCreateZoneModal}
        onClose={() => setShowCreateZoneModal(false)}
        onSubmit={handleCreateZone}
      />
      
      <AdminSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onUpdateCredentials={updateCredentials}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#1E3A8A',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sendButton: {
    padding: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  alertLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalSubmitText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  severityButtonActive: {
    borderWidth: 2,
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  activeAlertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearedBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearedText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Zone styles
  zoneCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  zoneTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  zoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearZoneButton: {
    padding: 4,
  },
  deleteZoneButton: {
    padding: 4,
  },
  zoneDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  zoneCoordinates: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  // Zone modal styles
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  statusButtonActive: {
    borderWidth: 2,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  coordinateInput: {
    flex: 1,
  },
  // Settings modal styles
  settingsSection: {
    marginBottom: 24,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingsDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});