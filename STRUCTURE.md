shopdb/
│
├── 📄 README.md                    # Project documentation
├── 📄 SETUP.md                     # Setup guide
├── 📄 .gitignore                   # Git ignore rules
├── 📄 shopdb.sql                   # Database schema
│
├── 📁 frontend/                    # React + Tailwind Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   └── ProductCard.jsx          # Reusable product card
│   │   │   ├── 📁 layout/
│   │   │   │   ├── Navbar.jsx               # Sticky navigation
│   │   │   │   └── Footer.jsx               # Multi-column footer
│   │   │   └── 📁 sections/
│   │   │       ├── HeroSection.jsx          # Hero banner
│   │   │       └── ProductList.jsx          # Product grid
│   │   ├── 📁 pages/                        # Full-page components
│   │   ├── 📁 hooks/
│   │   │   └── index.js                     # Custom hooks (useProducts, useCart, etc.)
│   │   ├── 📁 services/
│   │   │   └── api.js                       # Axios client & API calls
│   │   ├── 📁 utils/
│   │   │   └── helpers.js                   # Utility functions
│   │   ├── 📁 constants/
│   │   │   └── config.js                    # API endpoints & config
│   │   ├── 📁 context/                      # React Context (ready)
│   │   ├── 📁 public/
│   │   │   ├── index.html
│   │   │   └── 📁 assets/
│   │   │       └── 📁 img/
│   │   ├── App.jsx                          # Main app component
│   │   ├── index.css                        # Tailwind + custom styles
│   │   └── index.js                         # React entry point
│   ├── 📄 tailwind.config.js                # Tailwind configuration
│   ├── 📄 postcss.config.js                 # PostCSS configuration
│   ├── 📄 package.json                      # Frontend dependencies
│   ├── 📄 .env                              # Frontend env variables
│   └── 📁 node_modules/
│
├── 📁 backend/                     # Express.js Backend API
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   └── database.js                  # MySQL connection
│   │   ├── 📁 controllers/
│   │   │   └── productController.js         # Product business logic
│   │   ├── 📁 routes/
│   │   │   └── productRoutes.js             # Product API routes
│   │   ├── 📁 models/                       # Data models (ready)
│   │   ├── 📁 middleware/
│   │   │   └── errorHandler.js              # Error handling middleware
│   │   ├── 📁 utils/                        # Backend utilities (ready)
│   │   └── server.js                        # Express app setup
│   ├── 📄 package.json                      # Backend dependencies
│   ├── 📄 .env                              # Backend env variables
│   ├── 📁 node_modules/
│   └── 📁 (old files)
│       ├── server.js (deprecated)
│       ├── db.js (moved to src/config)
│       └── package-lock.json

## 🎯 Component Map

Navbar
└── Layout container
    ├── Logo
    ├── Navigation Links
    ├── Cart Button
    └── Mobile Menu

HeroSection
└── Gradient Background
    ├── Title
    ├── Description
    └── CTA Button

ProductList
└── Container
    └── ProductCard x N
        ├── Image Container
        │   ├── Image
        │   └── Overlay (Add to Cart)
        └── Product Info
            ├── Name
            ├── Price
            └── Buy Button

Footer
└── 4-Column Layout
    ├── About
    ├── Links
    ├── Social
    └── Contact

## 🔗 API Flow

Frontend
├── Components render
├── useEffect hooks fetch data
└── API Service
    └── Axios Client
        └── Backend
            ├── Routes (/products)
            ├── Controller (logic)
            └── MySQL Database
