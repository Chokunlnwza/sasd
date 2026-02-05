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
import { Book, Search, Pencil, Trash2, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBooks, deleteBook } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const ManageBooksScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    // Modal state
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);

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

    const handleEdit = (book) => {
        // Navigate to AddBookScreen but with params to indicate edit mode
        navigation.navigate('AddBook', { book });
    };

    const handleDeletePress = (book) => {
        setBookToDelete(book);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!bookToDelete) return;

        const id = bookToDelete._id;

        // Close modal immediately to show loading state on button or just proceed
        // If we close modal, the button needs to show loading? 
        // Actually, let's keep modal open OR just close it and show standard loading.
        // The original design had loading spinner on the button.
        // Let's close modal first.
        setDeleteModalVisible(false);

        try {
            setDeletingId(id);
            await deleteBook(id);
            Alert.alert('สำเร็จ', 'ลบหนังสือเรียบร้อยแล้ว');
            fetchBooks();
        } catch (error) {
            const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ';
            Alert.alert('ไม่สำเร็จ', message);
        } finally {
            setDeletingId(null);
            setBookToDelete(null);
        }
    };

    const renderBookItem = ({ item }) => {
        const isDeleting = deletingId === item._id;

        return (
            <View style={styles.bookCard}>
                <View style={styles.bookIcon}>
                    <Book color="#8B5CF6" size={28} />
                </View>
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.bookAuthor} numberOfLines={1}>
                        {item.author}
                    </Text>
                    <Text style={styles.bookStock}>
                        คงเหลือ: {item.quantity} เล่ม
                    </Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(item)}
                    >
                        <Pencil color="#F59E0B" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeletePress(item)}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <Trash2 color="#EF4444" size={20} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
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
        <View style={styles.container}>
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
                        colors={['#8B5CF6']}
                    />
                }
            />

            {/* Floating Add Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddBook')}
            >
                <Plus color="#FFFFFF" size={32} />
            </TouchableOpacity>

            <ConfirmationModal
                visible={deleteModalVisible}
                title="ยืนยันการลบ"
                message={`คุณต้องการลบหนังสือ "${bookToDelete?.title}" ใช่หรือไม่?`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                confirmText="ลบ"
                cancelText="ยกเลิก"
                isDestructive={true}
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
        paddingBottom: 80, // Space for FAB
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
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#EDE9FE',
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
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    bookStock: {
        fontSize: 12,
        color: '#8B5CF6',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEF3C7',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});

export default ManageBooksScreen;
