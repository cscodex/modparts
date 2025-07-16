import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getWishlist, addToWishlist, removeFromWishlist, moveToCart } from '../api/wishlist';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Safely get toast functions with fallbacks
  let success, showError;
  try {
    const toast = useToast();
    success = toast.success;
    showError = toast.error;
  } catch (err) {
    console.warn('Toast context not available, using console fallbacks');
    success = (msg) => console.log('Success:', msg);
    showError = (msg) => console.error('Error:', msg);
  }

  // Load wishlist when user is authenticated
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated()) {
        setLoading(true);
        setError(null);

        try {
          console.log('Fetching wishlist from database for authenticated user');
          const wishlistData = await getWishlist();
          const safeWishlistItems = (wishlistData.items || []).filter(item =>
            item && item.id && item.products && item.products.name
          );
          setWishlist(safeWishlistItems);
        } catch (err) {
          console.error('Failed to fetch wishlist:', err);
          setError('Failed to load wishlist');
        } finally {
          setLoading(false);
        }
      } else {
        // Clear wishlist for non-authenticated users
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // Add item to wishlist
  const addItem = async (product) => {
    if (!isAuthenticated()) {
      showError('Please login to add items to your wishlist');
      return false;
    }

    console.log('=== WISHLIST CONTEXT: ADD ITEM ===');
    console.log('Product:', product);

    try {
      setError(null);
      
      // Check if item is already in wishlist
      const existingItem = wishlist.find(item => item.product_id === product.id);
      if (existingItem) {
        showError('Item is already in your wishlist');
        return false;
      }

      // Add to wishlist via API
      await addToWishlist(product.id);

      // Refresh wishlist with null safety
      const wishlistData = await getWishlist();
      const safeWishlistItems = (wishlistData.items || []).filter(item =>
        item && item.id && item.products && item.products.name
      );
      setWishlist(safeWishlistItems);

      success(`${product.name} added to wishlist`);
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      const errorMessage = err.message || 'Failed to add item to wishlist';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  };

  // Remove item from wishlist
  const removeItem = async (productId, productName = 'Item') => {
    if (!isAuthenticated()) {
      return false;
    }

    console.log('=== WISHLIST CONTEXT: REMOVE ITEM ===');
    console.log('Product ID:', productId);

    try {
      setError(null);

      // Remove from wishlist via API
      await removeFromWishlist(productId);

      // Update local state with null safety
      setWishlist(prevWishlist =>
        prevWishlist.filter(item => item && item.product_id !== productId)
      );

      success(`${productName} removed from wishlist`);
      return true;
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      const errorMessage = err.message || 'Failed to remove item from wishlist';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  };

  // Move item from wishlist to cart
  const moveItemToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      showError('Please login to move items to cart');
      return false;
    }

    console.log('=== WISHLIST CONTEXT: MOVE TO CART ===');
    console.log('Product ID:', productId, 'Quantity:', quantity);

    try {
      setError(null);

      // Find the product in wishlist
      const wishlistItem = wishlist.find(item => item.product_id === productId);
      const productName = wishlistItem?.products?.name || 'Item';

      // Move to cart via API
      await moveToCart(productId, quantity);

      // Update local wishlist state
      setWishlist(prevWishlist => 
        prevWishlist.filter(item => item.product_id !== productId)
      );

      success(`${productName} moved to cart`);
      return true;
    } catch (err) {
      console.error('Failed to move to cart:', err);
      const errorMessage = err.message || 'Failed to move item to cart';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    try {
      return Array.isArray(wishlist) ? wishlist.some(item => item.product_id === productId) : false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    try {
      return Array.isArray(wishlist) ? wishlist.length : 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  };

  // Clear wishlist (for logout)
  const clearWishlist = () => {
    setWishlist([]);
    setError(null);
  };

  // Refresh wishlist
  const refreshWishlist = async () => {
    if (isAuthenticated()) {
      setLoading(true);
      try {
        const wishlistData = await getWishlist();
        setWishlist(wishlistData.items || []);
      } catch (err) {
        console.error('Failed to refresh wishlist:', err);
        setError('Failed to refresh wishlist');
      } finally {
        setLoading(false);
      }
    }
  };

  const value = {
    wishlist,
    loading,
    error,
    addItem,
    removeItem,
    moveItemToCart,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
