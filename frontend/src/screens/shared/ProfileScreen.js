import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import {
    User,
    LogOut,
    Shield,
    BookOpen,
    Settings,
    ChevronRight,
    Moon,
    Bell,
    HelpCircle,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';

const ProfileScreen = () => {
    const { user, logout, isAdmin } = useAuth();

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'ตกลง'
    });

    const handleLogout = () => {
        setModalConfig({
            title: 'ออกจากระบบ',
            message: 'คุณต้องการออกจากระบบใช่หรือไม่?',
            confirmText: 'ออกจากระบบ',
            isDestructive: true,
            onConfirm: () => {
                setModalVisible(false);
                logout();
            }
        });
        setModalVisible(true);
    };

    const showFeatureAlert = (title, message) => {
        setModalConfig({
            title: title,
            message: message,
            confirmText: 'ตกลง',
            isDestructive: false,
            onConfirm: () => setModalVisible(false)
        });
        setModalVisible(true);
    };

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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatar, isAdmin ? styles.avatarAdmin : styles.avatarMember]}>
                        <Text style={styles.avatarText}>
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.username}>{user?.username || 'ผู้ใช้'}</Text>
                    <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeMember]}>
                        {isAdmin ? (
                            <Shield color="#8B5CF6" size={14} />
                        ) : (
                            <User color="#10B981" size={14} />
                        )}
                        <Text style={[styles.roleText, isAdmin ? styles.roleTextAdmin : styles.roleTextMember]}>
                            {isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                        </Text>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>การตั้งค่า</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => showFeatureAlert('ตั้งค่าบัญชี', 'ฟีเจอร์นี้กำลังอยู่ในระหว่างการพัฒนา')}
                    >
                        <View style={[styles.menuIcon, styles.menuIconPurple]}>
                            <Settings color="#8B5CF6" size={20} />
                        </View>
                        <Text style={styles.menuText}>ตั้งค่าบัญชี</Text>
                        <ChevronRight color="#9CA3AF" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => showFeatureAlert('การแจ้งเตือน', 'คุณสามารถตั้งค่าการแจ้งเตือนได้ในเวอร์ชันถัดไป')}
                    >
                        <View style={[styles.menuIcon, styles.menuIconBlue]}>
                            <Bell color="#3B82F6" size={20} />
                        </View>
                        <Text style={styles.menuText}>การแจ้งเตือน</Text>
                        <ChevronRight color="#9CA3AF" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => showFeatureAlert('ธีม', 'รองรับ Dark Mode ในเร็วๆ นี้')}
                    >
                        <View style={[styles.menuIcon, styles.menuIconIndigo]}>
                            <Moon color="#6366F1" size={20} />
                        </View>
                        <Text style={styles.menuText}>ธีม</Text>
                        <ChevronRight color="#9CA3AF" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>สนับสนุน</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => showFeatureAlert('ช่วยเหลือ', 'ติดต่อ support@library.com หากพบปัญหา')}
                    >
                        <View style={[styles.menuIcon, styles.menuIconGreen]}>
                            <HelpCircle color="#10B981" size={20} />
                        </View>
                        <Text style={styles.menuText}>ช่วยเหลือ</Text>
                        <ChevronRight color="#9CA3AF" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => showFeatureAlert('เกี่ยวกับแอป', 'Library Management System v1.0.0\nDeveloped by User')}
                    >
                        <View style={[styles.menuIcon, styles.menuIconOrange]}>
                            <BookOpen color="#F59E0B" size={20} />
                        </View>
                        <Text style={styles.menuText}>เกี่ยวกับแอป</Text>
                        <ChevronRight color="#9CA3AF" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut color="#DC2626" size={22} />
                    <Text style={styles.logoutText}>ออกจากระบบ</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Library Management System v1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        paddingBottom: 32,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarAdmin: {
        backgroundColor: '#8B5CF6',
    },
    avatarMember: {
        backgroundColor: '#10B981',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    roleBadgeAdmin: {
        backgroundColor: '#EDE9FE',
    },
    roleBadgeMember: {
        backgroundColor: '#D1FAE5',
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    roleTextAdmin: {
        color: '#8B5CF6',
    },
    roleTextMember: {
        color: '#10B981',
    },
    menuSection: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuIconPurple: {
        backgroundColor: '#EDE9FE',
    },
    menuIconBlue: {
        backgroundColor: '#DBEAFE',
    },
    menuIconIndigo: {
        backgroundColor: '#E0E7FF',
    },
    menuIconGreen: {
        backgroundColor: '#D1FAE5',
    },
    menuIconOrange: {
        backgroundColor: '#FEF3C7',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEE2E2',
        marginHorizontal: 16,
        marginTop: 32,
        paddingVertical: 16,
        borderRadius: 14,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
        marginLeft: 10,
    },
    version: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 24,
    },
});

export default ProfileScreen;
