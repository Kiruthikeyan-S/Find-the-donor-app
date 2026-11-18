import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AboutScreen } from './src/screens/AboutScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { DonateScreen } from './src/screens/DonateScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MapScreen } from './src/screens/MapScreen';
import { MatchingDonorsScreen } from './src/screens/MatchingDonorsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RequestBloodScreen } from './src/screens/RequestBloodScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { COLORS } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        lazy: false,
        headerStyle: {
          backgroundColor: COLORS.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 19,
          color: COLORS.primary,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<
            string,
            { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
          > = {
            Home: { active: 'home', inactive: 'home-outline' },
            Donate: { active: 'water', inactive: 'water-outline' },
            Request: { active: 'alert-circle', inactive: 'alert-circle-outline' },
            Map: { active: 'map', inactive: 'map-outline' },
            Profile: { active: 'person', inactive: 'person-outline' },
          };
          const pair = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return <Ionicons name={focused ? pair.active : pair.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Find the Donor' }} />
      <Tab.Screen name="Donate" component={DonateScreen} options={{ title: 'Donate' }} />
      <Tab.Screen name="Request" component={RequestBloodScreen} options={{ title: 'Request' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Live Map' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, supabaseReady } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animation: 'slide_from_right',
          animationDuration: 200,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.primary,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {user || !supabaseReady ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MatchingDonors"
              component={MatchingDonorsScreen}
              options={{ title: 'Matching Donors' }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ title: 'About Blood Donation' }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{ title: 'Admin Dashboard' }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Log In' }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Forgot Password' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{ title: 'Create Account' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Forgot Password' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AuthProvider>
  );
}
