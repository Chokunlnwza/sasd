import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookPlus, BookOpen, Users, BarChart3, User } from 'lucide-react-native';

// Screens
import ManageBooksScreen from '../screens/admin/ManageBooksScreen';
import AddBookScreen from '../screens/admin/AddBookScreen';
import BorrowedBooksScreen from '../screens/admin/BorrowedBooksScreen';
import MembersScreen from '../screens/admin/MembersScreen';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ManageBooksStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ManageBooksList" component={ManageBooksScreen} />
            <Stack.Screen name="AddBook" component={AddBookScreen} />
        </Stack.Navigator>
    );
};

// Colors
const COLORS = {
    primary: '#8B5CF6',
    inactive: '#9CA3AF',
};

const AdminNavigator = () => {
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
                    fontSize: 11,
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
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'แดชบอร์ด',
                    headerTitle: '📊 แดชบอร์ด',
                    tabBarIcon: ({ color, size }) => (
                        <BarChart3 color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="ManageBooks"
                component={ManageBooksStack}
                options={{
                    title: 'จัดการหนังสือ',
                    headerTitle: '📚 จัดการหนังสือ',
                    headerShown: false, // Hide header because Stack has its own or we handle it
                    tabBarIcon: ({ color, size }) => (
                        <BookPlus color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="BorrowedBooks"
                component={BorrowedBooksScreen}
                options={{
                    title: 'ที่ถูกยืม',
                    headerTitle: '📖 หนังสือที่ถูกยืม',
                    tabBarIcon: ({ color, size }) => (
                        <BookOpen color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Members"
                component={MembersScreen}
                options={{
                    title: 'สมาชิก',
                    headerTitle: '👥 รายชื่อสมาชิก',
                    tabBarIcon: ({ color, size }) => (
                        <Users color={color} size={size} />
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

export default AdminNavigator;
