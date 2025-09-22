export interface EmergencyZone {
  id: string;
  name: string;
  status: 'active' | 'caution' | 'clear';
  coordinates: {
    x: number; // Percentage of screen width
    y: number; // Percentage of screen height
  };
  radius: number; // In pixels
  description: string;
  instructions?: string;
  updatedAt: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  isActive: boolean;
  location?: string;
  affectedAreas?: string[];
  instructions?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  criticalOnly: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}