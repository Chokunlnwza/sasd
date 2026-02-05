import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { BookOpen, User, Lock, UserPlus, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDestructive: false,
        confirmText: 'ตกลง',
        hideCancel: true
    });

    const showModal = (title, message, isError = true) => {
        setModalConfig({
            title,
            message,
            confirmText: 'ตกลง',
            isDestructive: isError,
            hideCancel: true,
            onConfirm: () => setModalVisible(false)
        });
        setModalVisible(true);
    };

    const handleRegister = async () => {
        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            showModal('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (username.trim().length < 3) {
            showModal('แจ้งเตือน', 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
            return;
        }

        if (password.length < 6) {
            showModal('แจ้งเตือน', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        if (password !== confirmPassword) {
            showModal('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');
            return;
        }

        setIsLoading(true);
        const result = await register(username.trim(), password, 'member');
        setIsLoading(false);

        if (!result.success) {
            showModal('สมัครสมาชิกไม่สำเร็จ', result.message);
        }
        // Navigation will be handled automatically by AppNavigator if success
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ConfirmationModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalVisible(false)}
                confirmText={modalConfig.confirmText}
                isDestructive={modalConfig.isDestructive}
                hideCancel={modalConfig.hideCancel}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft color="#6366F1" size={24} />
                    </TouchableOpacity>

                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <BookOpen color="#FFFFFF" size={48} />
                        </View>
                        <Text style={styles.title}>สมัครสมาชิก</Text>
                        <Text style={styles.subtitle}>สร้างบัญชีใหม่เพื่อใช้งานระบบ</Text>
                    </View>

                    {/* Register Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <User color="#6366F1" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ชื่อผู้ใช้"
                                placeholderTextColor="#9CA3AF"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock color="#6366F1" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="รหัสผ่าน"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock color="#10B981" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ยืนยันรหัสผ่าน"
                                placeholderTextColor="#9CA3AF"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <UserPlus color="#FFFFFF" size={20} style={styles.buttonIcon} />
                                    <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>มีบัญชีอยู่แล้ว? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 10,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: '#1F2937',
    },
    registerButton: {
        flexDirection: 'row',
        backgroundColor: '#10B981',
        borderRadius: 12,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonIcon: {
        marginRight: 8,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#6B7280',
        fontSize: 15,
    },
    loginLink: {
        color: '#6366F1',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default RegisterScreen;
