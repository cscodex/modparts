import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { processImageUrl, handleImageError } from '../utils/imageHelper';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useConfirm from '../hooks/useConfirm';

const Cart = () => {
  const { cart, total, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isOpen, confirm, handleClose, handleConfirm, dialogProps } = useConfirm();

  const handleQuantityChange = (itemId, productId, newQuantity, stockQuantity = null) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, productId, newQuantity, stockQuantity);
    }
  };

  const handleRemove = async (itemId, productId) => {
    try {
      await confirm({
        title: 'Remove Item',
        message: 'Are you sure you want to remove this item from your cart?',
        confirmText: 'Remove',
        cancelText: 'Cancel',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      });

      // If user confirms, proceed with removal
      removeFromCart(itemId, productId);
    } catch {
      // User cancelled the dialog
      console.log('Item removal cancelled');
    }
  };

  const handleClearCart = async () => {
    try {
      await confirm({
        title: 'Clear Cart',
        message: 'Are you sure you want to clear your entire cart? This action cannot be undone.',
        confirmText: 'Clear Cart',
        cancelText: 'Cancel',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      });

      // If user confirms, proceed with clearing cart
      clearCart();
    } catch {
      // User cancelled the dialog
      console.log('Clear cart cancelled');
    }
  };

  const handleCheckout = () => {
    if (isAuthenticated()) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogProps.title}
        message={dialogProps.message}
        confirmText={dialogProps.confirmText}
        cancelText={dialogProps.cancelText}
        confirmButtonClass={dialogProps.confirmButtonClass}
      />

      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">Loading your cart...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-red-600 mb-6">{error}</p>
          <Link
            to="/products"
            className="bg-blue-800 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Browse Products
          </Link>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link
            to="/products"
            className="bg-blue-800 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-4">Product</th>
                    <th className="text-center p-4">Price</th>
                    <th className="text-center p-4">Quantity</th>
                    <th className="text-center p-4">Total</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="w-16 h-16 bg-gray-200 mb-2 sm:mb-0 sm:mr-4">
                            {item.image_url ? (
                              <img
                                src={processImageUrl(item.image_url)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/products/${item.product_id}`}
                              className="font-semibold hover:text-blue-600"
                            >
                              {item.name}
                            </Link>
                            {item.stock_quantity && item.stock_quantity < 5 && (
                              <p className="text-sm text-red-600 mt-1">
                                Only {item.stock_quantity} left in stock!
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            className="bg-gray-200 px-2 py-1 rounded-l hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            onClick={() => handleQuantityChange(item.id, item.product_id, item.quantity - 1, item.stock_quantity)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.stock_quantity || 999}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (!isNaN(newQuantity)) {
                                handleQuantityChange(item.id, item.product_id, newQuantity, item.stock_quantity);
                              }
                            }}
                            className="w-16 text-center border-t border-b py-1"
                          />
                          <button
                            className="bg-gray-200 px-2 py-1 rounded-r hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            onClick={() => handleQuantityChange(item.id, item.product_id, item.quantity + 1, item.stock_quantity)}
                            disabled={item.stock_quantity && item.quantity >= item.stock_quantity}
                          >
                            +
                          </button>
                        </div>
                        {item.stock_quantity && item.quantity >= item.stock_quantity && (
                          <p className="text-xs text-orange-600 mt-1">
                            Maximum stock reached
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-center font-semibold">
                        ${item.subtotal ? parseFloat(item.subtotal).toFixed(2) : (parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleRemove(item.id, item.product_id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
              <Link
                to="/products"
                className="text-blue-800 hover:underline flex items-center justify-center sm:justify-start"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Continue Shopping
              </Link>

              <button
                onClick={handleClearCart}
                className="text-red-600 hover:underline flex items-center justify-center sm:justify-end"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Clear Cart
              </button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 mt-6 lg:mt-0">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="border-t border-b py-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-800 text-white py-3 rounded font-semibold hover:bg-blue-700"
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Loading...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
