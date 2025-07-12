# Development Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   npm run install-frontend
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

3. **Build the frontend**:
   ```bash
   npm run build
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

This will start:
- Backend API server on http://localhost:3000
- Frontend development server on http://localhost:5173

## API Endpoints

The development server provides these API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Environment Variables

Required environment variables in `.env.local`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

## Database Setup

Make sure your Supabase database has the required tables:
- `users`
- `categories` 
- `products`
- `cart_items`
- `orders`
- `order_items`

Refer to the database schema in the documentation for table structures.

## Troubleshooting

### Frontend can't connect to API
- Make sure the development server is running on port 3000
- Check that CORS is properly configured
- Verify environment variables are set correctly

### Database connection issues
- Verify Supabase credentials in `.env.local`
- Check that RLS policies are properly configured
- Ensure service role key has necessary permissions

### Build issues
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear frontend cache: `cd frontend && rm -rf node_modules package-lock.json && npm install`

## Production Deployment

For Vercel deployment:
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The `vercel.json` configuration will handle routing automatically.
