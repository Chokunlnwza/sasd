import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ==================== API Configuration ====================
// เปลี่ยน BASE_URL ตาม environment ของคุณ

// สำหรับ Android Emulator ใช้ 10.0.2.2
// สำหรับ iOS Simulator ใช้ localhost
// สำหรับอุปกรณ์จริง ใช้ IP ของเครื่อง

// เปลี่ยน IP Address ตรงนี้เป็น IP ของเครื่องคอมพิวเตอร์ของคุณ
// ดู IP ได้โดยเปิด Terminal แล้วพิมพ์ ipconfig (Windows) หรือ ifconfig (Mac/Linux)
const SERVER_IP = '172.29.61.66'; // UPDATE THIS IP

const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:5000';
    }
    // สำหรับ Android Emulator, iOS Simulator และ Physical Device
    return `http://${SERVER_IP}:5000`;
};

const BASE_URL = getBaseUrl();

// Create axios instance
const axiosClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - เพิ่ม token ใน header
axiosClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - จัดการ error
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // No response received
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ==================== API Functions ====================

// Auth APIs
export const register = (username, password, role = 'member') =>
    axiosClient.post('/register', { username, password, role });

export const login = (username, password) =>
    axiosClient.post('/login', { username, password });

// Book APIs
export const getBooks = () =>
    axiosClient.get('/books');

export const getBook = (id) =>
    axiosClient.get(`/books/${id}`);

export const addBook = (bookData) =>
    axiosClient.post('/books', bookData);

export const updateBook = (id, bookData) =>
    axiosClient.put(`/books/${id}`, bookData);

export const deleteBook = (id) =>
    axiosClient.delete(`/books/${id}`);

// Borrow/Return APIs
export const borrowBook = (book_id) =>
    axiosClient.post('/borrow', { book_id });

export const returnBook = (transaction_id) =>
    axiosClient.post('/return', { transaction_id });

export const getMyBorrowed = () =>
    axiosClient.get('/my-borrowed');

export const getHistory = (user_id) =>
    axiosClient.get(`/history/${user_id}`);

// Admin APIs
export const getBorrowedBooks = () =>
    axiosClient.get('/admin/borrowed-books');

export const getUsers = () =>
    axiosClient.get('/users');

export const deleteUser = (id) =>
    axiosClient.delete(`/users/${id}`);

export const getStats = () =>
    axiosClient.get('/admin/stats');

export default axiosClient;
