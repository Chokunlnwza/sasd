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
    TextInput,
} from 'react-native';
import { Book, Search, BookOpen, AlertCircle } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBooks, borrowBook } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const BooksScreen = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [borrowingId, setBorrowingId] = useState(null);

    const fetchBooks = async () => {
        try {
            const response = await getBooks();
            setBooks(response.data.data);
            setFilteredBooks(response.data.data);
        } catch (error) {
            console.error('Error fetching books:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลหนังสือได้');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBooks();
        }, [])
    );

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(
                (book) =>
                    book.title.toLowerCase().includes(query.toLowerCase()) ||
                    book.author.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    };

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'ตกลง'
    });

    const handleBorrow = (bookId, bookTitle) => {
        setModalConfig({
            title: 'ยืนยันการยืม',
            message: `คุณต้องการยืมหนังสือ "${bookTitle}" ใช่หรือไม่?`,
            confirmText: 'ยืม',
            isDestructive: false,
            onConfirm: async () => {
                try {
                    setModalVisible(false);
                    setBorrowingId(bookId);
                    await borrowBook(bookId);

                    // Show success modal
                    setTimeout(() => {
                        setModalConfig({
                            title: 'สำเร็จ',
                            message: 'ยืมหนังสือเรียบร้อยแล้ว',
                            confirmText: 'ตกลง',
                            isDestructive: false,
                            onConfirm: () => setModalVisible(false)
                        });
                        setModalVisible(true);
                    }, 500);

                    fetchBooks();
                } catch (error) {
                    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืมหนังสือ';
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
                } finally {
                    setBorrowingId(null);
                }
            }
        });
        setModalVisible(true);
    };

    const renderBookItem = ({ item }) => {
        const isAvailable = item.quantity > 0;
        const isBorrowing = borrowingId === item._id;

        return (
            <View style={styles.bookCard}>
                <View style={styles.bookIcon}>
                    <Book color="#6366F1" size={32} />
                </View>
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.bookAuthor}>โดย {item.author}</Text>
                    <View style={styles.bookMeta}>
                        <View
                            style={[
                                styles.statusBadge,
                                isAvailable ? styles.availableBadge : styles.unavailableBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    isAvailable ? styles.availableText : styles.unavailableText,
                                ]}
                            >
                                {isAvailable ? `พร้อมให้ยืม (${item.quantity})` : 'หมด'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={[
                        styles.borrowButton,
                        !isAvailable && styles.borrowButtonDisabled,
                    ]}
                    onPress={() => handleBorrow(item._id, item.title)}
                    disabled={!isAvailable || isBorrowing}
                >
                    {isBorrowing ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <BookOpen color="#FFFFFF" size={18} />
                            <Text style={styles.borrowButtonText}>ยืม</Text>
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
            <ConfirmationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalVisible(false)}
                confirmText={modalConfig.confirmText}
                isDestructive={modalConfig.isDestructive}
            />
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="ค้นหาหนังสือ..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            {/* Book List */}
            {filteredBooks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <AlertCircle color="#9CA3AF" size={64} />
                    <Text style={styles.emptyText}>ไม่พบหนังสือ</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBooks}
                    keyExtractor={(item) => item._id}
                    renderItem={renderBookItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchBooks();
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#1F2937',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    bookCard: {
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
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    bookMeta: {
        flexDirection: 'row',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    availableBadge: {
        backgroundColor: '#D1FAE5',
    },
    unavailableBadge: {
        backgroundColor: '#FEE2E2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    availableText: {
        color: '#059669',
    },
    unavailableText: {
        color: '#DC2626',
    },
    borrowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        marginLeft: 12,
    },
    borrowButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    borrowButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: '#9CA3AF',
    },
});

export default BooksScreen;
