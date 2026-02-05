import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Book, BookOpen, History, User } from 'lucide-react-native';

// Screens
import BooksScreen from '../screens/member/BooksScreen';
import BorrowedScreen from '../screens/member/BorrowedScreen';
import HistoryScreen from '../screens/member/HistoryScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Colors
const COLORS = {
    primary: '#6366F1',
    inactive: '#9CA3AF',
    background: '#F3F4F6',
};

const MemberNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 70,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: '#FFF',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tab.Screen
                name="Books"
                component={BooksScreen}
                options={{
                    title: 'หนังสือ',
                    headerTitle: '📚 รายการหนังสือ',
                    tabBarIcon: ({ color, size }) => (
                        <Book color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Borrowed"
                component={BorrowedScreen}
                options={{
                    title: 'ที่ยืมอยู่',
                    headerTitle: '📖 หนังสือที่ยืมอยู่',
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    title: 'ประวัติ',
                    headerTitle: '📋 ประวัติการยืม',
                    tabBarIcon: ({ color, size }) => (
                        <History color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'โปรไฟล์',
                    headerTitle: '👤 โปรไฟล์',
                    tabBarIcon: ({ color, size }) => (
                        <User color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MemberNavigator;
