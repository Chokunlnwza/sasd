import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';

const ConfirmationModal = ({ visible, title, message, onConfirm, onCancel, confirmText = 'ตกลง', cancelText = 'ยกเลิก', isDestructive = false }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onCancel}
                        >
                            <Text style={styles.textCancel}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, isDestructive ? styles.buttonDestructive : styles.buttonConfirm]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.textConfirm}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%',
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#1F2937',
    },
    modalMessage: {
        fontSize: 15,
        marginBottom: 24,
        textAlign: 'center',
        color: '#6B7280',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        flex: 1,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#F3F4F6',
    },
    buttonConfirm: {
        backgroundColor: '#8B5CF6',
    },
    buttonDestructive: {
        backgroundColor: '#EF4444',
    },
    textCancel: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 15,
    },
    textConfirm: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default ConfirmationModal;
