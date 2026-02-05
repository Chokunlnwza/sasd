import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Platform,
} from 'react-native';
import { BookOpen, User, Calendar, Clock, RotateCcw, CheckCircle, Search, AlertCircle, History } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBorrowedBooks, returnBook } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const BorrowedBooksScreen = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [borrowingId, setBorrowingId] = useState(null);
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'overdue', 'history'
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'ตกลง'
    });

    const fetchBorrowedBooks = async () => {
        try {
            const response = await getBorrowedBooks();
            setTransactions(response.data.data);
        } catch (error) {
            console.error('Error fetching borrowed books:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBorrowedBooks();
        }, [])
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

    const getDaysRemaining = (dueDate) => {
        if (!dueDate) return 0;
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const matchesSearch =
                item.book_id?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.user_id?.username?.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const daysRemaining = getDaysRemaining(item.due_date);
            const isOverdue = daysRemaining < 0 && item.status !== 'returned';

            if (activeTab === 'active') {
                return item.status === 'borrowed' && !isOverdue;
            } else if (activeTab === 'overdue') {
                return item.status === 'borrowed' && isOverdue;
            } else if (activeTab === 'history') {
                return item.status === 'returned';
            }
            return false;
        });
    }, [transactions, activeTab, searchQuery]);

    const handleReturn = (transactionId, bookTitle, username) => {
        setModalConfig({
            title: 'ยืนยันการคืน',
            message: `คืนหนังสือ "${bookTitle}" ของ ${username} ใช่หรือไม่?`,
            confirmText: 'ยืนยันการคืน',
            isDestructive: false,
            onConfirm: async () => {
                setModalVisible(false);
                try {
                    await returnBook(transactionId);
                    // Show success
                    setTimeout(() => {
                        setModalConfig({
                            title: 'สำเร็จ',
                            message: 'บันทึกการคืนหนังสือเรียบร้อยแล้ว',
                            confirmText: 'ตกลง',
                            isDestructive: false,
                            onConfirm: () => setModalVisible(false)
                        });
                        setModalVisible(true);
                    }, 500);
                    fetchBorrowedBooks();
                } catch (error) {
                    const message = error.response?.data?.message || 'เกิดข้อผิดพลาด';
                    setTimeout(() => {
                        setModalConfig({
                            title: 'ไม่สำเร็จ',
                            message: message,
                            confirmText: 'ตกลง',
                            isDestructive: true,
                            onConfirm: () => setModalVisible(false)
                        });
                        setModalVisible(true);
                    }, 500);
                }
            }
        });
        setModalVisible(true);
    };

    const renderTransactionItem = ({ item }) => {
        const daysRemaining = getDaysRemaining(item.due_date);
        const isOverdue = daysRemaining < 0 && item.status === 'borrowed';
        const isReturned = item.status === 'returned';

        return (
            <View style={[styles.transactionCard, isReturned && styles.cardReturned]}>
                <View style={[
                    styles.statusIndicator,
                    isReturned ? styles.indicatorGray : (isOverdue ? styles.indicatorRed : styles.indicatorGreen)
                ]} />

                <View style={styles.cardContent}>
                    {/* Header: Book Title & Status */}
                    <View style={styles.cardHeader}>
                        <View style={styles.bookIcon}>
                            <BookOpen color={isReturned ? '#9CA3AF' : '#8B5CF6'} size={24} />
                        </View>
                        <View style={styles.bookInfo}>
                            <Text style={[styles.bookTitle, isReturned && styles.textGray]} numberOfLines={1}>
                                {item.book_id?.title || 'ไม่ทราบชื่อหนังสือ'}
                            </Text>
                            <Text style={styles.bookAuthor}>
                                {item.book_id?.author || 'ไม่ทราบผู้แต่ง'}
                            </Text>
                        </View>
                        {isReturned && (
                            <View style={styles.returnedBadge}>
                                <CheckCircle color="#10B981" size={14} />
                                <Text style={styles.returnedText}>คืนแล้ว</Text>
                            </View>
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Details Grid */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <User color="#6B7280" size={14} />
                            <Text style={styles.detailText}>
                                ผู้ยืม: <Text style={styles.highlightText}>{item.user_id?.username || 'Guest'}</Text>
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Calendar color="#6B7280" size={14} />
                            <Text style={styles.detailText}>
                                ยืมเมื่อ: {formatDate(item.borrow_date)}
                            </Text>
                        </View>

                        {!isReturned && (
                            <View style={styles.detailRow}>
                                <Clock color={isOverdue ? '#EF4444' : '#059669'} size={14} />
                                <Text style={[styles.detailText, isOverdue ? styles.textRed : styles.textGreen]}>
                                    {isOverdue ? `เกินกำหนด ${Math.abs(daysRemaining)} วัน` : `เหลือเวลา ${daysRemaining} วัน`}
                                </Text>
                            </View>
                        )}

                        {isReturned && item.return_date && (
                            <View style={styles.detailRow}>
                                <History color="#6B7280" size={14} />
                                <Text style={styles.detailText}>
                                    คืนเมื่อ: {formatDate(item.return_date)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Action Button (Only for Active Borrowing) */}
                    {!isReturned && (
                        <TouchableOpacity
                            style={[styles.actionButton, isOverdue ? styles.btnRed : styles.btnPurple]}
                            onPress={() => handleReturn(item._id, item.book_id?.title, item.user_id?.username)}
                        >
                            <RotateCcw color="#FFFFFF" size={16} />
                            <Text style={styles.btnText}>บันทึกการคืน</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ConfirmationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalVisible(false)}
                confirmText={modalConfig.confirmText}
                isDestructive={modalConfig.isDestructive}
            />

            {/* Search & Stats */}
            <View style={styles.headerContainer}>
                <View style={styles.searchBar}>
                    <Search color="#9CA3AF" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="ค้นหาชื่อผู้ยืม หรือ ชื่อหนังสือ..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <BookOpen size={16} color={activeTab === 'active' ? '#FFFFFF' : '#6B7280'} />
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        กำลังยืม
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {transactions.filter(t => t.status === 'borrowed' && getDaysRemaining(t.due_date) >= 0).length}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overdue' && styles.activeTabRed]}
                    onPress={() => setActiveTab('overdue')}
                >
                    <AlertCircle size={16} color={activeTab === 'overdue' ? '#FFFFFF' : '#6B7280'} />
                    <Text style={[styles.tabText, activeTab === 'overdue' && styles.activeTabText]}>
                        เกินกำหนด
                    </Text>
                    <View style={[styles.badge, styles.badgeRed]}>
                        <Text style={styles.badgeText}>
                            {transactions.filter(t => t.status === 'borrowed' && getDaysRemaining(t.due_date) < 0).length}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTabGray]}
                    onPress={() => setActiveTab('history')}
                >
                    <History size={16} color={activeTab === 'history' ? '#FFFFFF' : '#6B7280'} />
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                        ประวัติ
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item) => item._id}
                renderItem={renderTransactionItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBorrowedBooks(); }} colors={['#8B5CF6']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>ไม่พบรายการที่ค้นหา</Text>
                    </View>
                }
            />
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
    },
    headerContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#1F2937',
        height: '100%',
        // Web fix
        outlineStyle: 'none',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#8B5CF6',
    },
    activeTabRed: {
        backgroundColor: '#EF4444',
    },
    activeTabGray: {
        backgroundColor: '#4B5563',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    badge: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeRed: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#4B5563',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    transactionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardReturned: {
        opacity: 0.8,
        backgroundColor: '#FAFAFA',
    },
    statusIndicator: {
        width: 6,
    },
    indicatorGreen: { backgroundColor: '#10B981' },
    indicatorRed: { backgroundColor: '#EF4444' },
    indicatorGray: { backgroundColor: '#9CA3AF' },

    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bookIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
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
    textGray: {
        color: '#6B7280',
        textDecorationLine: 'line-through',
    },
    bookAuthor: {
        fontSize: 13,
        color: '#6B7280',
    },
    returnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    returnedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    detailsContainer: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 13,
        color: '#6B7280',
    },
    highlightText: {
        color: '#1F2937',
        fontWeight: '500',
    },
    textRed: { color: '#EF4444', fontWeight: 'bold' },
    textGreen: { color: '#059669', fontWeight: 'bold' },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 16,
        gap: 8,
    },
    btnPurple: { backgroundColor: '#8B5CF6' },
    btnRed: { backgroundColor: '#EF4444' },
    btnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    }
});

export default BorrowedBooksScreen;
