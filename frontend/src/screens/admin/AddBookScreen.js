import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { BookPlus, BookOpen, User, Hash, FileText, Tag } from 'lucide-react-native';
import { addBook, updateBook } from '../../services/api';

const AddBookScreen = ({ navigation, route }) => {
    const isEditMode = route.params?.book;
    const existingBook = route.params?.book;

    const [formData, setFormData] = useState({
        title: existingBook?.title || '',
        author: existingBook?.author || '',
        quantity: existingBook?.quantity?.toString() || '1',
        description: existingBook?.description || '',
        isbn: existingBook?.isbn || '',
        category: existingBook?.category || '',
    });
    const [loading, setLoading] = useState(false);

    // Reset form when entering screen without params (Add mode)
    React.useEffect(() => {
        if (!existingBook) {
            setFormData({
                title: '',
                author: '',
                quantity: '1',
                description: '',
                isbn: '',
                category: '',
            });
        }
    }, [existingBook]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.title.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อหนังสือ');
            return;
        }
        if (!formData.author.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อผู้แต่ง');
            return;
        }
        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            Alert.alert('แจ้งเตือน', 'จำนวนหนังสือไม่ถูกต้อง');
            return;
        }

        try {
            setLoading(true);
            const bookData = {
                title: formData.title.trim(),
                author: formData.author.trim(),
                quantity: parseInt(formData.quantity),
                description: formData.description.trim(),
                isbn: formData.isbn.trim(),
                category: formData.category.trim() || 'ทั่วไป',
            };

            if (isEditMode) {
                await updateBook(existingBook._id, bookData);
                Alert.alert('สำเร็จ', 'แก้ไขหนังสือเรียบร้อยแล้ว', [
                    {
                        text: 'ตกลง',
                        onPress: () => navigation.goBack(),
                    },
                ]);
            } else {
                await addBook(bookData);
                Alert.alert('สำเร็จ', 'เพิ่มหนังสือเรียบร้อยแล้ว', [
                    {
                        text: 'ตกลง',
                        onPress: () => {
                            setFormData({
                                title: '',
                                author: '',
                                quantity: '1',
                                description: '',
                                isbn: '',
                                category: '',
                            });
                            navigation.navigate('ManageBooks');
                        },
                    },
                ]);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'เกิดข้อผิดพลาด';
            Alert.alert('ไม่สำเร็จ', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerIcon}>
                        <BookPlus color="#FFFFFF" size={36} />
                    </View>
                    <Text style={styles.headerTitle}>
                        {isEditMode ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือใหม่'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {isEditMode ? 'แก้ไขข้อมูลหนังสือด้านล่าง' : 'กรอกข้อมูลหนังสือด้านล่าง'}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ชื่อหนังสือ *</Text>
                        <View style={styles.inputContainer}>
                            <BookOpen color="#8B5CF6" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ระบุชื่อหนังสือ"
                                placeholderTextColor="#9CA3AF"
                                value={formData.title}
                                onChangeText={(value) => handleChange('title', value)}
                            />
                        </View>
                    </View>

                    {/* Author */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ผู้แต่ง *</Text>
                        <View style={styles.inputContainer}>
                            <User color="#8B5CF6" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ระบุชื่อผู้แต่ง"
                                placeholderTextColor="#9CA3AF"
                                value={formData.author}
                                onChangeText={(value) => handleChange('author', value)}
                            />
                        </View>
                    </View>

                    {/* Quantity */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>จำนวน *</Text>
                        <View style={styles.inputContainer}>
                            <Hash color="#8B5CF6" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                placeholderTextColor="#9CA3AF"
                                value={formData.quantity}
                                onChangeText={(value) => handleChange('quantity', value)}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* ISBN */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ISBN</Text>
                        <View style={styles.inputContainer}>
                            <Hash color="#8B5CF6" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="978-xxx-xxx-xxx"
                                placeholderTextColor="#9CA3AF"
                                value={formData.isbn}
                                onChangeText={(value) => handleChange('isbn', value)}
                            />
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>หมวดหมู่</Text>
                        <View style={styles.inputContainer}>
                            <Tag color="#8B5CF6" size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="นิยาย, วิชาการ, ฯลฯ"
                                placeholderTextColor="#9CA3AF"
                                value={formData.category}
                                onChangeText={(value) => handleChange('category', value)}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>คำอธิบาย</Text>
                        <View style={[styles.inputContainer, styles.textareaContainer]}>
                            <FileText color="#8B5CF6" size={20} style={[styles.inputIcon, styles.textareaIcon]} />
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                placeholder="รายละเอียดหนังสือ..."
                                placeholderTextColor="#9CA3AF"
                                value={formData.description}
                                onChangeText={(value) => handleChange('description', value)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <BookPlus color="#FFFFFF" size={22} />
                                <Text style={styles.submitButtonText}>
                                    {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
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
        padding: 16,
        paddingBottom: 32,
    },
    headerCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    headerIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textareaContainer: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    textareaIcon: {
        marginTop: 2,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#1F2937',
    },
    textarea: {
        height: 100,
        paddingTop: 0,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default AddBookScreen;
