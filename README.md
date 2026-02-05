# Library Management System

ระบบจัดการห้องสมุด - Library Management System with Node.js Backend and React Native (Expo) Frontend

## 📁 Project Structure

```
finaly/
├── backend/                # Node.js Express Backend
│   ├── src/
│   │   ├── index.js        # Main server file with all API endpoints
│   │   ├── models/
│   │   │   ├── User.js     # User model
│   │   │   ├── Book.js     # Book model
│   │   │   └── Transaction.js # Transaction model
│   │   └── middleware/
│   │       └── auth.js     # JWT authentication middleware
│   ├── .env                # Environment variables
│   └── package.json
│
└── frontend/               # React Native Expo Frontend
    ├── App.js              # Main App component
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js    # Global auth state
    │   ├── navigation/
    │   │   ├── AppNavigator.js   # Main navigator
    │   │   ├── AuthNavigator.js  # Auth stack
    │   │   ├── MemberNavigator.js # Member tabs
    │   │   └── AdminNavigator.js  # Admin tabs
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── LoginScreen.js
    │   │   │   └── RegisterScreen.js
    │   │   ├── member/
    │   │   │   ├── BooksScreen.js
    │   │   │   ├── BorrowedScreen.js
    │   │   │   └── HistoryScreen.js
    │   │   ├── admin/
    │   │   │   ├── DashboardScreen.js
    │   │   │   ├── AddBookScreen.js
    │   │   │   ├── BorrowedBooksScreen.js
    │   │   │   └── MembersScreen.js
    │   │   └── shared/
    │   │       └── ProfileScreen.js
    │   └── services/
    │       └── api.js      # Axios client & API functions
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Cloud - MongoDB Atlas)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

4. **Start the server:**
```bash
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

### Frontend Setup

1. **Navigate to frontend folder:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API URL:**
Edit `src/services/api.js` and update `BASE_URL` if needed:
```javascript
const BASE_URL = 'http://localhost:5000';
```

4. **Start Expo:**
```bash
npx expo start
```

## 📱 Features

### Member Features
- ✅ View all books with availability status
- ✅ Search books by title/author
- ✅ Borrow books (if available)
- ✅ Return borrowed books
- ✅ View borrowing history

### Admin Features
- ✅ Dashboard with statistics
- ✅ Add new books
- ✅ View all borrowed books
- ✅ Process book returns
- ✅ View member list

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | Get all books |
| GET | `/books/:id` | Get book by ID |
| POST | `/books` | Add book (Admin) |
| PUT | `/books/:id` | Update book (Admin) |
| DELETE | `/books/:id` | Delete book (Admin) |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/borrow` | Borrow a book |
| POST | `/return` | Return a book |
| GET | `/my-borrowed` | Get user's borrowed books |
| GET | `/history/:user_id` | Get borrowing history |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/borrowed-books` | All borrowed books |
| GET | `/users` | List all members |
| GET | `/admin/stats` | Dashboard statistics |

## 🧪 Testing with Postman

### Register
```json
POST /register
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```

### Login
```json
POST /login
{
  "username": "admin",
  "password": "admin123"
}
```

### Add Book (with Bearer Token)
```json
POST /books
Authorization: Bearer <token>
{
  "title": "Harry Potter",
  "author": "J.K. Rowling",
  "quantity": 5
}
```

### Borrow Book
```json
POST /borrow
Authorization: Bearer <token>
{
  "book_id": "<book_id>"
}
```

### Return Book
```json
POST /return
Authorization: Bearer <token>
{
  "transaction_id": "<transaction_id>"
}
```

## 🎨 Tech Stack

- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs
- **Frontend:** React Native, Expo, React Navigation, Axios
- **Database:** MongoDB
- **Icons:** Lucide React Native
- **State Management:** React Context API

## 👤 Default Accounts

Create these accounts for testing:

**Admin:**
- Username: `admin`
- Password: `admin123`
- Role: `admin`

**Member:**
- Username: `member`
- Password: `member123`
- Role: `member`

## 📄 License

MIT License
