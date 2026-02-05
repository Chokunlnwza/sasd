const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'กรุณากรอกชื่อหนังสือ'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'กรุณากรอกชื่อผู้แต่ง'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'กรุณากรอกจำนวนหนังสือ'],
        min: [0, 'จำนวนหนังสือต้องไม่น้อยกว่า 0'],
        default: 1
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    isbn: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: 'ทั่วไป'
    }
}, {
    timestamps: true
});

// Virtual for availability status
bookSchema.virtual('isAvailable').get(function () {
    return this.quantity > 0;
});

// Ensure virtuals are included in JSON output
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
