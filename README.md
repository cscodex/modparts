# Yamaha RD Parts Shop

A responsive e-commerce website for Yamaha RD motorcycle parts, built with React, PHP, and MySQL.

## Features

- Browse products by category
- View detailed product information
- Add items to cart
- Checkout and place orders
- User authentication (register/login)
- Order tracking
- Admin dashboard with inventory and order management

## Tech Stack

- **Frontend**: React 19.1.0, Vite 6.3.5, Tailwind CSS
- **Backend**: Node.js serverless functions (Vercel compatible)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Authentication**: JWT tokens with Supabase
- **Payment Processing**: Stripe integration ready

## Prerequisites

- [Node.js](https://nodejs.org/) installed (version 18 or higher)
- [Supabase](https://supabase.com) account for database
- [Vercel](https://vercel.com) account for deployment (optional for local development)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) package manager

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/yamaha-rd-parts.git
cd yamaha-rd-parts
```

### 2. Set up the backend

1. Start XAMPP and ensure Apache and MySQL services are running
2. Open your web browser and navigate to `http://localhost/phpmyadmin`
3. Run the database initialization script:

```bash
php init_database.php
```

This will create the database, tables, and insert sample data.

### 3. Set up the frontend

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Usage

### Customer Interface

1. Open your web browser and navigate to `http://localhost:5173` (or the port shown in your terminal)
2. Browse products, add items to cart, and place orders
3. Register an account to track orders and manage your profile

### Admin Interface

1. Login with admin credentials:
   - Email: admin@yamahaparts.com
   - Password: admin123
2. Access the admin dashboard to manage products, view orders, and export data

## Project Structure

```
yamaha-rd-parts/
├── api/                  # PHP backend
│   ├── config/           # Database configuration
│   ├── controllers/      # API endpoints
│   ├── middleware/       # Authentication middleware
│   ├── models/           # Data models
│   └── utils/            # Utility functions
├── frontend/             # React frontend
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── api/          # API service functions
│       ├── components/   # Reusable UI components
│       ├── context/      # Context providers
│       ├── pages/        # Page components
│       └── utils/        # Utility functions
└── init_database.php     # Database initialization script
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [XAMPP](https://www.apachefriends.org/index.html)

```
Modparts
├─ .DS_Store
├─ .htaccess
├─ README.md
├─ SERVER_RESTART_INSTRUCTIONS.md
├─ admin_access.php
├─ api
│  ├─ .htaccess
│  ├─ config
│  │  ├─ database.php
│  │  └─ database.sql
│  ├─ controllers
│  │  ├─ admin
│  │  │  ├─ all_orders.php
│  │  │  └─ dashboard.php
│  │  ├─ cart
│  │  │  ├─ add.php
│  │  │  ├─ clear.php
│  │  │  ├─ import.php
│  │  │  ├─ read.php
│  │  │  ├─ remove.php
│  │  │  └─ update.php
│  │  ├─ categories
│  │  │  └─ read.php
│  │  ├─ debug
│  │  │  ├─ get_error_logs.php
│  │  │  └─ get_logs.php
│  │  ├─ get_profile.php
│  │  ├─ login.php
│  │  ├─ logout.php
│  │  ├─ orders
│  │  │  ├─ create.php
│  │  │  ├─ export.php
│  │  │  ├─ read_one.php
│  │  │  ├─ read_user_orders.php
│  │  │  └─ update_status.php
│  │  ├─ products
│  │  │  ├─ create.php
│  │  │  ├─ delete.php
│  │  │  ├─ read.php
│  │  │  ├─ read_by_category.php
│  │  │  ├─ read_one.php
│  │  │  ├─ search.php
│  │  │  └─ update.php
│  │  ├─ register.php
│  │  ├─ update_profile.php
│  │  └─ users
│  │     ├─ create.php
│  │     ├─ create_table.php
│  │     ├─ delete.php
│  │     ├─ read.php
│  │     ├─ update.php
│  │     └─ update_schema.php
│  ├─ cors-proxy.php
│  ├─ includes
│  │  └─ cors_headers.php
│  ├─ index.php
│  ├─ middleware
│  │  ├─ auth.php
│  │  └─ cors.php
│  ├─ mock
│  │  └─ mock_dashboard.php
│  ├─ models
│  │  ├─ CartItem.php
│  │  ├─ Category.php
│  │  ├─ Order.php
│  │  ├─ Product.php
│  │  ├─ SimpleCartItem.php
│  │  └─ User.php
│  ├─ my_orders.php
│  ├─ setup
│  ├─ upload.php
│  ├─ uploads
│  │  ├─ .htaccess
│  │  ├─ img_681a9c775cba1.jpg
│  │  ├─ img_681a9c78a5e16.jpg
│  │  ├─ img_681a9c78d097d.jpg
│  │  ├─ img_681a9c7905196.jpg
│  │  ├─ img_681a9c91e25e0.jpeg
│  │  ├─ img_681a9cf2d9b79.jpeg
│  │  ├─ img_681a9da1376ff.jpeg
│  │  ├─ img_681a9e81c23ab.png
│  │  ├─ img_681b141132def.jpg
│  │  ├─ img_68349c00a52a9.jpg
│  │  ├─ img_6834aa1b9533a.jpg
│  │  ├─ img_6834aa3a70589.jpg
│  │  └─ img_683504537bcf2.jpg
│  └─ utils
├─ assets
├─ build_react.sh
├─ create_admin.php
├─ database_schema.xml
├─ debug_file_input.html
├─ deploy_react.sh
├─ frontend
│  ├─ README.md
│  ├─ dist
│  │  ├─ .DS_Store
│  │  ├─ assets
│  │  │  └─ index.js
│  │  ├─ index.html
│  │  └─ vite.svg
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ proxy-server.js
│  ├─ public
│  │  ├─ download-csv.php
│  │  ├─ placeholder-image.jpg
│  │  ├─ placeholder-image.svg
│  │  ├─ sample-products.csv
│  │  └─ vite.svg
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ api
│  │  │  ├─ auth.js
│  │  │  ├─ cart.js
│  │  │  ├─ categories.js
│  │  │  ├─ config.js
│  │  │  ├─ dashboard.js
│  │  │  ├─ myOrders.js
│  │  │  ├─ orders.js
│  │  │  ├─ products.js
│  │  │  └─ users.js
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ RangeSlider.jsx
│  │  │  ├─ admin
│  │  │  │  ├─ CSVImportModal.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  └─ UserFormModal.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ AdminRoute.jsx
│  │  │  │  └─ ProtectedRoute.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ AdminLayout.jsx
│  │  │  │  ├─ Footer.jsx
│  │  │  │  └─ Header.jsx
│  │  │  └─ ui
│  │  │     ├─ ConfirmDialog.jsx
│  │  │     ├─ Modal.jsx
│  │  │     ├─ Pagination.jsx
│  │  │     ├─ ProgressBar.jsx
│  │  │     └─ Toast.jsx
│  │  ├─ context
│  │  │  ├─ AuthContext.jsx
│  │  │  ├─ CartContext.jsx
│  │  │  └─ ToastContext.jsx
│  │  ├─ hooks
│  │  │  └─ useConfirm.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ Cart.jsx
│  │  │  ├─ Checkout.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ MyOrders.jsx
│  │  │  ├─ NotFound.jsx
│  │  │  ├─ OrderConfirmation.jsx
│  │  │  ├─ OrderDetail.jsx
│  │  │  ├─ ProductDetail.jsx
│  │  │  ├─ ProductList.jsx
│  │  │  ├─ Profile.jsx
│  │  │  ├─ Register.jsx
│  │  │  └─ admin
│  │  │     ├─ Dashboard.jsx
│  │  │     ├─ Orders.jsx
│  │  │     ├─ ProductForm.jsx
│  │  │     ├─ Products.jsx
│  │  │     └─ Users.jsx
│  │  ├─ styles
│  │  │  └─ print.css
│  │  └─ utils
│  │     ├─ cache.js
│  │     ├─ exportUtils.js
│  │     └─ imageHelper.js
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ index.php
├─ promote_to_admin.php
├─ public
│  ├─ assets
│  │  ├─ html2canvas.esm-CiaFdv3w.js
│  │  ├─ index-maqz7mgC.css
│  │  ├─ index.es-BBFgdfEu.js
│  │  ├─ index.js
│  │  └─ purify.es-BDD-b7lE.js
│  ├─ download-csv.php
│  ├─ index.html
│  ├─ placeholder-image.jpg
│  ├─ placeholder-image.svg
│  ├─ sample-products.csv
│  └─ vite.svg
├─ restart.php
├─ restart_server.sh
└─ schema.xml

```
```
Modparts
├─ .DS_Store
├─ .htaccess
├─ README.md
├─ SERVER_RESTART_INSTRUCTIONS.md
├─ admin_access.php
├─ api
│  ├─ .htaccess
│  ├─ config
│  │  ├─ database.php
│  │  └─ database.sql
│  ├─ controllers
│  │  ├─ admin
│  │  │  ├─ all_orders.php
│  │  │  └─ dashboard.php
│  │  ├─ cart
│  │  │  ├─ add.php
│  │  │  ├─ clear.php
│  │  │  ├─ import.php
│  │  │  ├─ read.php
│  │  │  ├─ remove.php
│  │  │  └─ update.php
│  │  ├─ categories
│  │  │  └─ read.php
│  │  ├─ debug
│  │  │  ├─ get_error_logs.php
│  │  │  └─ get_logs.php
│  │  ├─ get_profile.php
│  │  ├─ login.php
│  │  ├─ logout.php
│  │  ├─ orders
│  │  │  ├─ create.php
│  │  │  ├─ export.php
│  │  │  ├─ read_one.php
│  │  │  ├─ read_user_orders.php
│  │  │  └─ update_status.php
│  │  ├─ products
│  │  │  ├─ create.php
│  │  │  ├─ delete.php
│  │  │  ├─ read.php
│  │  │  ├─ read_by_category.php
│  │  │  ├─ read_one.php
│  │  │  ├─ search.php
│  │  │  └─ update.php
│  │  ├─ register.php
│  │  ├─ update_profile.php
│  │  └─ users
│  │     ├─ create.php
│  │     ├─ create_table.php
│  │     ├─ delete.php
│  │     ├─ read.php
│  │     ├─ update.php
│  │     └─ update_schema.php
│  ├─ cors-proxy.php
│  ├─ includes
│  │  └─ cors_headers.php
│  ├─ index.php
│  ├─ middleware
│  │  ├─ auth.php
│  │  └─ cors.php
│  ├─ mock
│  │  └─ mock_dashboard.php
│  ├─ models
│  │  ├─ CartItem.php
│  │  ├─ Category.php
│  │  ├─ Order.php
│  │  ├─ Product.php
│  │  ├─ SimpleCartItem.php
│  │  └─ User.php
│  ├─ my_orders.php
│  ├─ setup
│  ├─ upload.php
│  ├─ uploads
│  │  ├─ .htaccess
│  │  ├─ img_681a9c775cba1.jpg
│  │  ├─ img_681a9c78a5e16.jpg
│  │  ├─ img_681a9c78d097d.jpg
│  │  ├─ img_681a9c7905196.jpg
│  │  ├─ img_681a9c91e25e0.jpeg
│  │  ├─ img_681a9cf2d9b79.jpeg
│  │  ├─ img_681a9da1376ff.jpeg
│  │  ├─ img_681a9e81c23ab.png
│  │  ├─ img_681b141132def.jpg
│  │  ├─ img_68349c00a52a9.jpg
│  │  ├─ img_6834aa1b9533a.jpg
│  │  ├─ img_6834aa3a70589.jpg
│  │  └─ img_683504537bcf2.jpg
│  └─ utils
├─ assets
├─ build_react.sh
├─ create_admin.php
├─ database_schema.xml
├─ debug_file_input.html
├─ deploy_react.sh
├─ frontend
│  ├─ README.md
│  ├─ dist
│  │  ├─ .DS_Store
│  │  ├─ assets
│  │  │  └─ index.js
│  │  ├─ index.html
│  │  └─ vite.svg
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ proxy-server.js
│  ├─ public
│  │  ├─ download-csv.php
│  │  ├─ placeholder-image.jpg
│  │  ├─ placeholder-image.svg
│  │  ├─ sample-products.csv
│  │  └─ vite.svg
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ api
│  │  │  ├─ auth.js
│  │  │  ├─ cart.js
│  │  │  ├─ categories.js
│  │  │  ├─ config.js
│  │  │  ├─ dashboard.js
│  │  │  ├─ myOrders.js
│  │  │  ├─ orders.js
│  │  │  ├─ products.js
│  │  │  └─ users.js
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ RangeSlider.jsx
│  │  │  ├─ admin
│  │  │  │  ├─ CSVImportModal.jsx
│  │  │  │  ├─ Sidebar.jsx
│  │  │  │  └─ UserFormModal.jsx
│  │  │  ├─ auth
│  │  │  │  ├─ AdminRoute.jsx
│  │  │  │  └─ ProtectedRoute.jsx
│  │  │  ├─ layout
│  │  │  │  ├─ AdminLayout.jsx
│  │  │  │  ├─ Footer.jsx
│  │  │  │  └─ Header.jsx
│  │  │  └─ ui
│  │  │     ├─ ConfirmDialog.jsx
│  │  │     ├─ Modal.jsx
│  │  │     ├─ Pagination.jsx
│  │  │     ├─ ProgressBar.jsx
│  │  │     └─ Toast.jsx
│  │  ├─ context
│  │  │  ├─ AuthContext.jsx
│  │  │  ├─ CartContext.jsx
│  │  │  └─ ToastContext.jsx
│  │  ├─ hooks
│  │  │  └─ useConfirm.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ Cart.jsx
│  │  │  ├─ Checkout.jsx
│  │  │  ├─ Home.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ MyOrders.jsx
│  │  │  ├─ NotFound.jsx
│  │  │  ├─ OrderConfirmation.jsx
│  │  │  ├─ OrderDetail.jsx
│  │  │  ├─ ProductDetail.jsx
│  │  │  ├─ ProductList.jsx
│  │  │  ├─ Profile.jsx
│  │  │  ├─ Register.jsx
│  │  │  └─ admin
│  │  │     ├─ Dashboard.jsx
│  │  │     ├─ Orders.jsx
│  │  │     ├─ ProductForm.jsx
│  │  │     ├─ Products.jsx
│  │  │     └─ Users.jsx
│  │  ├─ styles
│  │  │  └─ print.css
│  │  └─ utils
│  │     ├─ cache.js
│  │     ├─ exportUtils.js
│  │     └─ imageHelper.js
│  ├─ tailwind.config.js
│  └─ vite.config.js
├─ index.php
├─ promote_to_admin.php
├─ public
│  ├─ assets
│  │  ├─ html2canvas.esm-CiaFdv3w.js
│  │  ├─ index-maqz7mgC.css
│  │  ├─ index.es-BBFgdfEu.js
│  │  ├─ index.js
│  │  └─ purify.es-BDD-b7lE.js
│  ├─ download-csv.php
│  ├─ index.html
│  ├─ placeholder-image.jpg
│  ├─ placeholder-image.svg
│  ├─ sample-products.csv
│  └─ vite.svg
├─ restart.php
├─ restart_server.sh
└─ schema.xml

```#   m o d p a r t s  
 