const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'กรุณาระบุผู้ใช้']
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'กรุณาระบุหนังสือ']
    },
    borrow_date: {
        type: Date,
        default: Date.now
    },
    due_date: {
        type: Date,
        default: function () {
            // Default due date is 7 days from borrow date
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date;
        }
    },
    return_date: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned'],
        default: 'borrowed'
    }
}, {
    timestamps: true
});

// Populate user and book info when querying
transactionSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user_id',
        select: 'username role'
    }).populate({
        path: 'book_id',
        select: 'title author'
    });
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
