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
} from 'react-native';
import { BookOpen, User, Lock, LogIn } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, error, clearError } = useAuth();

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }

        setIsLoading(true);
        const result = await login(username.trim(), password);
        setIsLoading(false);

        if (!result.success) {
            Alert.alert('เข้าสู่ระบบไม่สำเร็จ', result.message);
        }
        // Navigation will be handled automatically by AppNavigator
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <BookOpen color="#FFFFFF" size={48} />
                    </View>
                    <Text style={styles.title}>Library Management</Text>
                    <Text style={styles.subtitle}>ระบบจัดการห้องสมุด</Text>
                </View>

                {/* Login Form */}
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

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <LogIn color="#FFFFFF" size={20} style={styles.buttonIcon} />
                                <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Quick Login Buttons (Dev Only) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: '#4B5563', flex: 1, paddingVertical: 8 }]}
                            onPress={() => {
                                setUsername('admin');
                                setPassword('admin123');
                            }}
                        >
                            <Text style={{ color: '#FFF', textAlign: 'center', fontSize: 12 }}>Admin Demo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: '#10B981', flex: 1, paddingVertical: 8 }]}
                            onPress={() => {
                                setUsername('member');
                                setPassword('member123');
                            }}
                        >
                            <Text style={{ color: '#FFF', textAlign: 'center', fontSize: 12 }}>Member Demo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>ยังไม่มีบัญชี? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>สมัครสมาชิก</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>© 2024 Library Management System</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#6366F1',
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
    loginButton: {
        flexDirection: 'row',
        backgroundColor: '#6366F1',
        borderRadius: 12,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#6366F1',
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
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#6B7280',
        fontSize: 15,
    },
    registerLink: {
        color: '#6366F1',
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 32,
    },
});

export default LoginScreen;
