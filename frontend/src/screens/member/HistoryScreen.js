import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { BookOpen, Calendar, CheckCircle, Clock } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getHistory } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HistoryScreen = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const response = await getHistory(user._id);
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดประวัติได้');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (user?._id) {
                fetchHistory();
            }
        }, [user?._id])
    );

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderHistoryItem = ({ item }) => {
        const isReturned = item.status === 'returned';

        return (
            <View style={styles.historyCard}>
                <View style={[styles.statusIndicator, isReturned ? styles.returnedIndicator : styles.borrowedIndicator]} />
                <View style={styles.cardContent}>
                    <View style={styles.bookRow}>
                        <View style={styles.bookIcon}>
                            <BookOpen color={isReturned ? '#10B981' : '#6366F1'} size={24} />
                        </View>
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle} numberOfLines={2}>
                                {item.book_id?.title || 'ไม่ทราบชื่อหนังสือ'}
                            </Text>
                            <Text style={styles.bookAuthor}>
                                {item.book_id?.author || 'ไม่ทราบผู้แต่ง'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Calendar color="#6B7280" size={14} />
                            <Text style={styles.detailLabel}>วันที่ยืม:</Text>
                            <Text style={styles.detailValue}>{formatDate(item.borrow_date)}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Clock color="#6B7280" size={14} />
                            <Text style={styles.detailLabel}>กำหนดคืน:</Text>
                            <Text style={styles.detailValue}>{formatDate(item.due_date)}</Text>
                        </View>

                        {isReturned && (
                            <View style={styles.detailRow}>
                                <CheckCircle color="#10B981" size={14} />
                                <Text style={styles.detailLabel}>วันที่คืน:</Text>
                                <Text style={[styles.detailValue, styles.returnedDate]}>
                                    {formatDate(item.return_date)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.statusBadge, isReturned ? styles.returnedBadge : styles.borrowedBadge]}>
                        <Text style={[styles.statusText, isReturned ? styles.returnedText : styles.borrowedText]}>
                            {isReturned ? 'คืนแล้ว' : 'กำลังยืม'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>กำลังโหลด...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {transactions.filter((t) => t.status === 'borrowed').length}
                    </Text>
                    <Text style={styles.statLabel}>กำลังยืม</Text>
                </View>
                <View style={[styles.statCard, styles.statCardGreen]}>
                    <Text style={[styles.statNumber, styles.statNumberGreen]}>
                        {transactions.filter((t) => t.status === 'returned').length}
                    </Text>
                    <Text style={styles.statLabel}>คืนแล้ว</Text>
                </View>
                <View style={[styles.statCard, styles.statCardPurple]}>
                    <Text style={[styles.statNumber, styles.statNumberPurple]}>
                        {transactions.length}
                    </Text>
                    <Text style={styles.statLabel}>ทั้งหมด</Text>
                </View>
            </View>

            {/* History List */}
            {transactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <BookOpen color="#D1D5DB" size={80} />
                    <Text style={styles.emptyTitle}>ไม่มีประวัติการยืม</Text>
                    <Text style={styles.emptySubtitle}>
                        ประวัติการยืม-คืนหนังสือจะแสดงที่นี่
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderHistoryItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchHistory();
                            }}
                            colors={['#6366F1']}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
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
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6366F1',
    },
    statCardGreen: {
        borderColor: '#10B981',
    },
    statCardPurple: {
        borderColor: '#8B5CF6',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6366F1',
    },
    statNumberGreen: {
        color: '#10B981',
    },
    statNumberPurple: {
        color: '#8B5CF6',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    listContent: {
        padding: 16,
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'row',
    },
    statusIndicator: {
        width: 4,
    },
    returnedIndicator: {
        backgroundColor: '#10B981',
    },
    borrowedIndicator: {
        backgroundColor: '#6366F1',
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    bookRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    bookAuthor: {
        fontSize: 13,
        color: '#6B7280',
    },
    detailsContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 8,
        width: 70,
    },
    detailValue: {
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
    },
    returnedDate: {
        color: '#10B981',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    returnedBadge: {
        backgroundColor: '#D1FAE5',
    },
    borrowedBadge: {
        backgroundColor: '#EEF2FF',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    returnedText: {
        color: '#059669',
    },
    borrowedText: {
        color: '#6366F1',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default HistoryScreen;
