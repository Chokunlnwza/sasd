import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MemberNavigator from './MemberNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Show loading screen while checking auth status
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth screens
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : isAdmin ? (
                    // Admin screens
                    <Stack.Screen name="AdminMain" component={AdminNavigator} />
                ) : (
                    // Member screens
                    <Stack.Screen name="MemberMain" component={MemberNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
});

export default AppNavigator;
