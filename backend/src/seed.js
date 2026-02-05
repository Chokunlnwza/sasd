require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');

// Initial Data
const users = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
    },
    {
        username: 'member',
        password: 'member123',
        role: 'member'
    }
];

const books = [
    {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        quantity: 5,
        category: 'Fiction',
        description: 'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'
    },
    {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        quantity: 3,
        category: 'Fiction',
        description: 'The story of a young girl growing up in the 1930s in the deep South.'
    },
    {
        title: '1984',
        author: 'George Orwell',
        quantity: 10,
        category: 'Science Fiction',
        description: 'A dystopian social science fiction novel and cautionary tale.'
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB:', process.env.MONGODB_URI);

        // Clear existing data
        await User.deleteMany({});
        await Book.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create Users
        for (const user of users) {
            await User.create(user);
        }
        console.log('👤 Created Users (admin/admin123, member/member123)');

        // Create Books
        await Book.insertMany(books);
        console.log('📚 Created Initial Books');

        console.log('✨ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
