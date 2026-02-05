import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { BookOpen, RotateCcw, Calendar, Clock } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyBorrowed, returnBook } from '../../services/api';

const BorrowedScreen = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [returningId, setReturningId] = useState(null);

    const fetchBorrowed = async () => {
        try {
            const response = await getMyBorrowed();
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Error fetching borrowed books:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBorrowed();
        }, [])
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDaysRemaining = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleReturn = async (transactionId, bookTitle) => {
        Alert.alert(
            'ยืนยันการคืน',
            `คุณต้องการคืนหนังสือ "${bookTitle}" ใช่หรือไม่?`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'คืน',
                    onPress: async () => {
                        try {
                            setReturningId(transactionId);
                            await returnBook(transactionId);
                            Alert.alert('สำเร็จ', 'คืนหนังสือเรียบร้อยแล้ว');
                            fetchBorrowed();
                        } catch (error) {
                            const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการคืนหนังสือ';
                            Alert.alert('ไม่สำเร็จ', message);
                        } finally {
                            setReturningId(null);
                        }
                    },
                },
            ]
        );
    };

    const renderTransactionItem = ({ item }) => {
        const daysRemaining = getDaysRemaining(item.due_date);
        const isOverdue = daysRemaining < 0;
        const isReturning = returningId === item._id;

        return (
            <View style={styles.transactionCard}>
                <View style={styles.bookIcon}>
                    <BookOpen color="#6366F1" size={28} />
                </View>
                <View style={styles.transactionInfo}>
                    <Text style={styles.bookTitle} numberOfLines={2}>
                        {item.book_id?.title || 'ไม่ทราบชื่อหนังสือ'}
                    </Text>
                    <Text style={styles.bookAuthor}>
                        {item.book_id?.author || 'ไม่ทราบผู้แต่ง'}
                    </Text>
                    <View style={styles.dateRow}>
                        <Calendar color="#6B7280" size={14} />
                        <Text style={styles.dateText}>
                            ยืมเมื่อ: {formatDate(item.borrow_date)}
                        </Text>
                    </View>
                    <View style={styles.dateRow}>
                        <Clock color={isOverdue ? '#DC2626' : '#059669'} size={14} />
                        <Text
                            style={[
                                styles.dueText,
                                isOverdue ? styles.overdueText : styles.normalDueText,
                            ]}
                        >
                            {isOverdue
                                ? `เลยกำหนด ${Math.abs(daysRemaining)} วัน`
                                : `เหลือ ${daysRemaining} วัน`}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.returnButton}
                    onPress={() => handleReturn(item._id, item.book_id?.title)}
                    disabled={isReturning}
                >
                    {isReturning ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <RotateCcw color="#FFFFFF" size={18} />
                            <Text style={styles.returnButtonText}>คืน</Text>
                        </>
                    )}
                </TouchableOpacity>
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
            {transactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <BookOpen color="#D1D5DB" size={80} />
                    <Text style={styles.emptyTitle}>ไม่มีหนังสือที่ยืมอยู่</Text>
                    <Text style={styles.emptySubtitle}>
                        เมื่อคุณยืมหนังสือ จะแสดงที่นี่
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item._id}
                    renderItem={renderTransactionItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchBorrowed();
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
    listContent: {
        padding: 16,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    bookIcon: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionInfo: {
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
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 6,
    },
    dueText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    normalDueText: {
        color: '#059669',
    },
    overdueText: {
        color: '#DC2626',
    },
    returnButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        marginLeft: 12,
    },
    returnButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
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

export default BorrowedScreen;
