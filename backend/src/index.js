require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import models
const User = require('./models/User');
const Book = require('./models/Book');
const Transaction = require('./models/Transaction');

// Import middleware
const { protect, adminOnly, generateToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จ'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Health Check Endpoint for Docker
app.get('/api/health', (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        status: 'OK',
        timestamp: Date.now(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
    try {
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.status = 'ERROR';
        healthcheck.message = error.message;
        res.status(503).json(healthcheck);
    }
});

// ==================== AUTH ROUTES ====================

// Register - สมัครสมาชิก
app.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
            });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            role: role || 'member'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ',
            data: {
                _id: user._id,
                username: user.username,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
        });
    }
});

// Login - เข้าสู่ระบบ
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            data: {
                _id: user._id,
                username: user.username,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        });
    }
});

// ==================== BOOK ROUTES ====================

// GET /books - ดูหนังสือทั้งหมด
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ'
        });
    }
});

// GET /books/:id - ดูหนังสือตาม ID
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหนังสือ'
            });
        }

        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ'
        });
    }
});

// POST /books - เพิ่มหนังสือ (Admin only)
app.post('/books', protect, adminOnly, async (req, res) => {
    try {
        const { title, author, quantity, description, isbn, category } = req.body;

        const book = await Book.create({
            title,
            author,
            quantity: quantity || 1,
            description,
            isbn,
            category
        });

        res.status(201).json({
            success: true,
            message: 'เพิ่มหนังสือสำเร็จ',
            data: book
        });
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มหนังสือ'
        });
    }
});

// PUT /books/:id - แก้ไขหนังสือ (Admin only)
app.put('/books/:id', protect, adminOnly, async (req, res) => {
    try {
        const { title, author, quantity, description, isbn, category } = req.body;

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, quantity, description, isbn, category },
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหนังสือ'
            });
        }

        res.json({
            success: true,
            message: 'แก้ไขหนังสือสำเร็จ',
            data: book
        });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการแก้ไขหนังสือ'
        });
    }
});

// DELETE /books/:id - ลบหนังสือ (Admin only)
app.delete('/books/:id', protect, adminOnly, async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหนังสือ'
            });
        }

        res.json({
            success: true,
            message: 'ลบหนังสือสำเร็จ'
        });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบหนังสือ'
        });
    }
});

// ==================== BORROW/RETURN ROUTES ====================

// POST /borrow - ยืมหนังสือ
app.post('/borrow', protect, async (req, res) => {
    try {
        const { book_id } = req.body;
        const user_id = req.user._id;

        // Check if book exists
        const book = await Book.findById(book_id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบหนังสือ'
            });
        }

        // Check if book is available
        if (book.quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'หนังสือหมด'
            });
        }

        // Check if user already borrowed this book
        const existingTransaction = await Transaction.findOne({
            user_id,
            book_id,
            status: 'borrowed'
        });

        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                message: 'คุณยืมหนังสือเล่มนี้อยู่แล้ว'
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            user_id,
            book_id
        });

        // Decrease book quantity
        book.quantity -= 1;
        await book.save();

        // Populate transaction data
        await transaction.populate([
            { path: 'user_id', select: 'username' },
            { path: 'book_id', select: 'title author' }
        ]);

        res.status(201).json({
            success: true,
            message: 'ยืมหนังสือสำเร็จ',
            data: transaction
        });
    } catch (error) {
        console.error('Borrow error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการยืมหนังสือ'
        });
    }
});

// POST /return - คืนหนังสือ
app.post('/return', protect, async (req, res) => {
    try {
        const { transaction_id } = req.body;

        // Find transaction
        const transaction = await Transaction.findById(transaction_id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบรายการยืม'
            });
        }

        // Check if already returned
        if (transaction.status === 'returned') {
            return res.status(400).json({
                success: false,
                message: 'หนังสือถูกคืนแล้ว'
            });
        }

        // Update transaction
        transaction.status = 'returned';
        transaction.return_date = new Date();
        await transaction.save();

        // Increase book quantity
        const book = await Book.findById(transaction.book_id._id || transaction.book_id);
        if (book) {
            book.quantity += 1;
            await book.save();
        }

        res.json({
            success: true,
            message: 'คืนหนังสือสำเร็จ',
            data: transaction
        });
    } catch (error) {
        console.error('Return error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการคืนหนังสือ'
        });
    }
});

// GET /my-borrowed - ดูหนังสือที่ยืมอยู่ (สำหรับ Member)
app.get('/my-borrowed', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user_id: req.user._id,
            status: 'borrowed'
        }).sort({ borrow_date: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Get my borrowed error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        });
    }
});

// GET /history/:user_id - ดูประวัติการยืม
app.get('/history/:user_id', protect, async (req, res) => {
    try {
        // Check if user is accessing their own history or is admin
        if (req.user._id.toString() !== req.params.user_id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
            });
        }

        const transactions = await Transaction.find({
            user_id: req.params.user_id
        }).sort({ borrow_date: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงประวัติ'
        });
    }
});

// ==================== ADMIN ROUTES ====================

// GET /admin/borrowed-books - ดูรายการยืมคืนทั้งหมด (Admin only)
app.get('/admin/borrowed-books', protect, adminOnly, async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user_id', 'username')
            .populate('book_id', 'title author coverImage') // Ensure details are populated
            .sort({ borrow_date: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Get borrowed books error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        });
    }
});

// GET /users - ดูสมาชิกทั้งหมด (Admin only)
app.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({ role: 'member' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก'
        });
    }
});

// DELETE /users/:id - ลบสมาชิก (Admin only)
app.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบสมาชิก'
            });
        }

        // Optional: Delete related transactions?
        // await Transaction.deleteMany({ user_id: req.params.id });

        res.json({
            success: true,
            message: 'ลบสมาชิกสำเร็จ'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบสมาชิก'
        });
    }
});

// GET /admin/stats - สถิติ Dashboard (Admin only)
app.get('/admin/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalBooks = await Book.countDocuments();
        const totalMembers = await User.countDocuments({ role: 'member' });
        const activeBorrows = await Transaction.countDocuments({ status: 'borrowed' });
        const totalTransactions = await Transaction.countDocuments();

        res.json({
            success: true,
            data: {
                totalBooks,
                totalMembers,
                activeBorrows,
                totalTransactions
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
        });
    }
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Library Management System API`);
    console.log(`🔗 http://localhost:${PORT}`);
});
