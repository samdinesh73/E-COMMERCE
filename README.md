# ShopDB - Full Stack E-Commerce Platform

A modern, production-ready full-stack e-commerce application built with React, Tailwind CSS, Node.js, Express, and MySQL.

## 🏗️ Project Structure

```
shopdb/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Reusable UI components
│   │   │   ├── layout/       # Layout components (Navbar, Footer)
│   │   │   └── sections/     # Page sections (Hero, ProductList)
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # App constants
│   │   ├── context/          # React context for state management
│   │   ├── App.jsx           # Main App component
│   │   ├── index.js          # Entry point
│   │   └── index.css         # Global styles with Tailwind
│   ├── public/               # Static assets
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── postcss.config.js     # PostCSS configuration
│   └── package.json
│
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── routes/           # API routes
│   │   ├── models/           # Data models
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Express server
│   ├── .env                  # Environment variables
│   └── package.json
│
├── shopdb.sql                # Database schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MySQL
- Git

### Backend Setup

```bash
cd backend
npm install
# Update .env with your database credentials
npm run dev  # Development mode with nodemon
# OR
npm start    # Production mode
```

**Backend runs on:** `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

**Frontend runs on:** `http://localhost:3000`

## 📦 Dependencies

### Frontend
- **React** 18.2.0 - UI library
- **Tailwind CSS** 3.3.0 - Utility-first CSS framework
- **Axios** 1.6.0 - HTTP client
- **React Router** 6.20.0 - Client-side routing

### Backend
- **Express** 4.19.0 - Web framework
- **CORS** 2.8.5 - Cross-origin resource sharing
- **MySQL2** 3.9.0 - Database driver
- **dotenv** 16.3.1 - Environment variables

## 📚 API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product

### Health Check
- `GET /health` - Server status

## 🎨 Features

- ✅ Responsive design with Tailwind CSS
- ✅ Modern component architecture
- ✅ Production-level folder structure
- ✅ RESTful API
- ✅ Database integration with MySQL
- ✅ Error handling middleware
- ✅ Environment configuration
- ✅ Reusable components and hooks

## 🔧 Configuration

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

### Backend (.env)
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shop_db
PORT=5000
NODE_ENV=development
```

## 📝 Database Setup

1. Create database from `shopdb.sql`:
```sql
source shopdb.sql;
```

2. Verify tables:
```sql
SHOW TABLES;
DESCRIBE products;
```

## 🚀 Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

### Production Frontend
```bash
npm start
```

### Production Backend
```bash
cd backend
npm start
```

## 📖 Development Tips

- Use custom hooks in `src/hooks` for shared logic
- Keep components small and focused
- Use Tailwind utility classes for styling
- Create reusable components in `src/components/common`
- API calls go through `src/services/api.js`
- Utility functions in `src/utils/helpers.js`

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env or kill the process
# Linux/Mac: lsof -i :5000
# Windows: netstat -ano | findstr :5000
```

**Database connection error:**
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

**CORS errors:**
- Backend CORS is configured for all origins in development
- Modify `cors()` in `server.js` for production

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Coding! 🎉**
