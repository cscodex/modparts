# Vercel Deployment Guide for Yamaha RD Parts Shop

## Pre-Deployment Steps

### 1. File Structure Preparation
The project has been restructured for Vercel deployment:

```
/
├── api-vercel/              # Serverless API functions for Vercel
│   ├── auth/
│   │   ├── login.js
│   │   └── register.js
│   ├── admin/
│   │   ├── users.js
│   │   ├── dashboard.js
│   │   └── orders.js
│   ├── products/
│   │   ├── index.js
│   │   └── [id].js
│   ├── cart/
│   │   └── index.js
│   ├── categories/
│   │   └── index.js
│   ├── orders/
│   │   └── index.js
│   └── upload/
│       └── index.js
├── frontend/               # React application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── package-root.json      # Root dependencies for API
├── vercel.json            # Vercel configuration
└── README.md
```

### 2. Replace Root Package.json
Before deploying, replace the current `package.json` with `package-root.json`:

```bash
# In your project root
move package-root.json package.json
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Restructure for Vercel deployment with Node.js/Supabase"
git push origin main
```

## Vercel Deployment Settings

### Framework Configuration
- ✅ **Framework Preset**: Vite
- ✅ **Root Directory**: `frontend`
- ✅ **Build Command**: `vite build`
- ✅ **Output Directory**: `dist`
- ✅ **Install Command**: `npm install`

### Environment Variables
Add these in Vercel dashboard:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
```

## API Endpoints Available After Deployment

Your deployed app will have these API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Remove from cart

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/users` - Create user (admin)
- `PUT /api/admin/users` - Update user (admin)
- `DELETE /api/admin/users` - Delete user (admin)
- `GET /api/admin/dashboard` - Dashboard stats (admin)
- `GET /api/admin/orders` - All orders (admin)
- `PUT /api/admin/orders` - Update order status (admin)

### Upload
- `POST /api/upload` - File upload endpoint

## Admin Access
- **Email**: `admin@yamahaparts.com`
- **Password**: `admin123`

## Post-Deployment Testing

1. **Test basic functionality**:
   - Visit your deployed URL
   - Register a new user
   - Browse products
   - Add items to cart
   - Place an order

2. **Test admin functionality**:
   - Login with admin credentials
   - Access `/admin/users`
   - Access `/admin/dashboard`
   - Manage users and orders

## Important Notes

1. **Database**: Make sure your Supabase database is properly configured with all tables and the admin user
2. **CORS**: All API endpoints include proper CORS headers for cross-origin requests
3. **Authentication**: JWT tokens are used for authentication with 24-hour expiry
4. **File Uploads**: Currently returns placeholder responses - implement actual file storage as needed
5. **Cart Storage**: Uses database-based cart storage (cart_items table)

## Troubleshooting

If you encounter issues:

1. **Check Vercel Function Logs**: Go to Vercel dashboard → Functions tab
2. **Verify Environment Variables**: Ensure all required env vars are set
3. **Database Connection**: Test Supabase connection in Vercel logs
4. **API Endpoints**: Test individual endpoints using browser dev tools

## Next Steps After Deployment

1. **Custom Domain**: Add your custom domain in Vercel settings
2. **SSL Certificate**: Vercel provides automatic SSL
3. **Performance**: Monitor performance in Vercel analytics
4. **File Storage**: Implement proper file upload with Supabase Storage or Cloudinary
5. **Email**: Add email notifications for orders
6. **Payment**: Integrate payment processing (Stripe, PayPal, etc.)
