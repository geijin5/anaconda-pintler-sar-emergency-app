import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { EmergencyProvider } from "@/providers/emergency-provider";
import { AuthProvider } from "@/providers/auth-provider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#1E3A8A',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Anaconda Pintler SAR",
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="alerts" 
        options={{ 
          title: "Emergency Alerts",
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="alert-details" 
        options={{ 
          title: "Alert Details",
          presentation: 'card'
        }} 
      />
      <Stack.Screen 
        name="admin-login" 
        options={{ 
          title: "Admin Login",
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="admin-dashboard" 
        options={{ 
          title: "Admin Dashboard",
          headerShown: true
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <EmergencyProvider>
            <RootLayoutNav />
          </EmergencyProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}