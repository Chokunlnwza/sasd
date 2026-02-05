import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { User, Calendar, Users, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getUsers, deleteUser } from '../../services/api';

const MembersScreen = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchMembers = async () => {
        try {
            const response = await getUsers();
            setMembers(response.data.data);
        } catch (error) {
            console.error('Error fetching members:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสมาชิกได้');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMembers();
        }, [])
    );

    const handleDelete = (id, username) => {
        Alert.alert(
            'ยืนยันการลบ',
            `คุณต้องการลบสมาชิก "${username}" ใช่หรือไม่?`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบ',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeletingId(id);
                            await deleteUser(id);
                            Alert.alert('สำเร็จ', 'ลบสมาชิกเรียบร้อยแล้ว');
                            fetchMembers();
                        } catch (error) {
                            const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ';
                            Alert.alert('ไม่สำเร็จ', message);
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getAvatarColor = (index) => {
        const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1'];
        return colors[index % colors.length];
    };

    const renderMemberItem = ({ item, index }) => {
        const isDeleting = deletingId === item._id;

        return (
            <View style={styles.memberCard}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(index) }]}>
                    <Text style={styles.avatarText}>
                        {item.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.username}</Text>
                    <View style={styles.memberMeta}>
                        <View style={styles.roleBadge}>
                            <User color="#6B7280" size={12} />
                            <Text style={styles.roleText}>สมาชิก</Text>
                        </View>
                    </View>
                    <View style={styles.dateRow}>
                        <Calendar color="#9CA3AF" size={12} />
                        <Text style={styles.dateText}>
                            เข้าร่วมเมื่อ {formatDate(item.createdAt)}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item._id, item.username)}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Trash2 color="#EF4444" size={20} />
                    )}
                </TouchableOpacity>
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
            {/* Stats Header */}
            <View style={styles.statsHeader}>
                <View style={styles.statCard}>
                    <Users color="#8B5CF6" size={28} />
                    <View style={styles.statContent}>
                        <Text style={styles.statNumber}>{members.length}</Text>
                        <Text style={styles.statLabel}>สมาชิกทั้งหมด</Text>
                    </View>
                </View>
            </View>

            {/* Members List */}
            {members.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Users color="#D1D5DB" size={80} />
                    <Text style={styles.emptyTitle}>ยังไม่มีสมาชิก</Text>
                    <Text style={styles.emptySubtitle}>
                        รายชื่อสมาชิกจะแสดงที่นี่
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={members}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMemberItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchMembers();
                            }}
                            colors={['#8B5CF6']}
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
    statsHeader: {
        padding: 16,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statContent: {
        marginLeft: 16,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B5CF6',
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    memberCard: {
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
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
    },
    memberMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
        fontWeight: '500',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 6,
    },
    deleteButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
        marginLeft: 8,
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

export default MembersScreen;
