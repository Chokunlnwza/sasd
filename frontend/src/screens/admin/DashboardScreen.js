import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from 'react-native';
import { Book, Users, BookOpen, TrendingUp, RefreshCw } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>กำลังโหลด...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />
            }
        >
            {/* Welcome Section */}
            <View style={styles.welcomeCard}>
                <View style={styles.welcomeContent}>
                    <Text style={styles.welcomeText}>สวัสดี, {user?.username}! 👋</Text>
                    <Text style={styles.roleText}>ผู้ดูแลระบบ</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                    <RefreshCw color="#8B5CF6" size={20} />
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <Text style={styles.sectionTitle}>ภาพรวมระบบ</Text>
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.statCardBooks]}>
                    <View style={styles.statIconContainer}>
                        <Book color="#FFFFFF" size={28} />
                    </View>
                    <Text style={styles.statNumber}>{stats?.totalBooks || 0}</Text>
                    <Text style={styles.statLabel}>หนังสือทั้งหมด</Text>
                </View>

                <View style={[styles.statCard, styles.statCardUsers]}>
                    <View style={[styles.statIconContainer, styles.iconContainerGreen]}>
                        <Users color="#FFFFFF" size={28} />
                    </View>
                    <Text style={[styles.statNumber, styles.numberGreen]}>{stats?.totalMembers || 0}</Text>
                    <Text style={styles.statLabel}>สมาชิกทั้งหมด</Text>
                </View>

                <View style={[styles.statCard, styles.statCardBorrowed]}>
                    <View style={[styles.statIconContainer, styles.iconContainerOrange]}>
                        <BookOpen color="#FFFFFF" size={28} />
                    </View>
                    <Text style={[styles.statNumber, styles.numberOrange]}>{stats?.activeBorrows || 0}</Text>
                    <Text style={styles.statLabel}>กำลังถูกยืม</Text>
                </View>

                <View style={[styles.statCard, styles.statCardTransactions]}>
                    <View style={[styles.statIconContainer, styles.iconContainerBlue]}>
                        <TrendingUp color="#FFFFFF" size={28} />
                    </View>
                    <Text style={[styles.statNumber, styles.numberBlue]}>{stats?.totalTransactions || 0}</Text>
                    <Text style={styles.statLabel}>รายการทั้งหมด</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>เมนูลัด</Text>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('ManageBooks')}
                >
                    <View style={styles.actionIcon}>
                        <Book color="#8B5CF6" size={24} />
                    </View>
                    <Text style={styles.actionText}>จัดการหนังสือ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('Members')}
                >
                    <View style={styles.actionIcon}>
                        <Users color="#10B981" size={24} />
                    </View>
                    <Text style={styles.actionText}>จัดการสมาชิก</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('BorrowedBooks')}
                >
                    <View style={styles.actionIcon}>
                        <BookOpen color="#F59E0B" size={24} />
                    </View>
                    <Text style={styles.actionText}>รายการยืม</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Library Management System v1.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 12,
        color: '#6B7280',
        fontSize: 16,
    },
    welcomeCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeContent: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainerGreen: {
        backgroundColor: '#10B981',
    },
    iconContainerOrange: {
        backgroundColor: '#F59E0B',
    },
    iconContainerBlue: {
        backgroundColor: '#3B82F6',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B5CF6',
        marginBottom: 4,
    },
    numberGreen: {
        color: '#10B981',
    },
    numberOrange: {
        color: '#F59E0B',
    },
    numberBlue: {
        color: '#3B82F6',
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default DashboardScreen;
