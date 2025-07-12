import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../api/cart';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from API when user is authenticated
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError(null);

      if (isAuthenticated()) {
        try {
          console.log('Fetching cart from database for authenticated user');
          const cartData = await getCart();
          setCart(cartData.items || []);
          setTotal(cartData.total || 0);
          setCount(cartData.count || 0);

          // If we have items in localStorage and none in the database, try to import them
          if ((cartData.items?.length === 0 || !cartData.items) && localStorage.getItem('cart')) {
            try {
              const localCart = localStorage.getItem('cart');
              const cartItems = JSON.parse(localCart);

              if (cartItems && cartItems.length > 0) {
                console.log('Importing cart items from localStorage to database:', cartItems);
                const { importCart } = await import('../api/cart');
                await importCart(cartItems);

                // Fetch the cart again after import
                const updatedCartData = await getCart();
                setCart(updatedCartData.items || []);
                setTotal(updatedCartData.total || 0);
                setCount(updatedCartData.count || 0);

                // Clear localStorage cart after successful import
                localStorage.removeItem('cart');
                console.log('Cart imported successfully and removed from localStorage');
              }
            } catch (importErr) {
              console.error('Failed to import cart from localStorage:', importErr);
            }
          }
        } catch (err) {
          console.error('Failed to fetch cart from database:', err);
          setError('Failed to load cart data');

          // Fallback to localStorage if API fails
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            const newTotal = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setTotal(newTotal);
            setCount(parsedCart.length);
          }
        } finally {
          setLoading(false);
        }
      } else {
        // User is not authenticated, use localStorage
        console.log('Using localStorage cart for non-authenticated user');
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            const newTotal = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setTotal(newTotal);
            setCount(parsedCart.length);
          } catch (parseErr) {
            console.error('Failed to parse cart from localStorage:', parseErr);
            setError('Failed to load cart data from localStorage');
            // Clear invalid cart data
            localStorage.removeItem('cart');
          }
        } else {
          // No cart in localStorage
          setCart([]);
          setTotal(0);
          setCount(0);
        }
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  // Save cart to localStorage as a fallback
  useEffect(() => {
    if (!isAuthenticated()) {
      localStorage.setItem('cart', JSON.stringify(cart));

      // Calculate total and count
      const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(newTotal);
      setCount(cart.length);
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product, quantity = 1) => {
    console.log('=== CART CONTEXT: ADD TO CART ===');
    console.log('Product:', product);
    console.log('Quantity:', quantity);
    console.log('Available stock:', product.quantity);
    console.log('Is authenticated:', isAuthenticated());

    try {
      // Validate stock availability
      if (!product.quantity || product.quantity <= 0) {
        setError('This product is out of stock');
        throw new Error('Product is out of stock');
      }

      // Check if requested quantity exceeds available stock
      if (quantity > product.quantity) {
        setError(`Only ${product.quantity} items available in stock`);
        throw new Error(`Requested quantity (${quantity}) exceeds available stock (${product.quantity})`);
      }

      // Check if adding this quantity would exceed stock when combined with existing cart items
      const productId = product.product_id || product.id;
      const existingCartItem = cart.find(item => {
        const itemProductId = item.product_id || item.id;
        return itemProductId === productId;
      });

      const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      if (totalRequestedQuantity > product.quantity) {
        const availableToAdd = product.quantity - currentCartQuantity;
        if (availableToAdd <= 0) {
          setError('You already have the maximum available quantity in your cart');
          throw new Error('Maximum quantity already in cart');
        } else {
          setError(`You can only add ${availableToAdd} more of this item (${currentCartQuantity} already in cart, ${product.quantity} total stock)`);
          throw new Error(`Can only add ${availableToAdd} more items`);
        }
      }

      console.log('Stock validation passed');
      console.log('Using product_id:', productId);

      try {
        console.log('Attempting to add to cart via API');
        await apiAddToCart(productId, quantity);
        console.log('API call successful');

        // Refresh cart after adding item
        console.log('Refreshing cart data');
        const cartData = await getCart();
        console.log('Cart data received:', cartData);

        setCart(cartData.items || []);
        setTotal(cartData.total || 0);
        setCount(cartData.count || 0);

        console.log('Cart state updated from API');
      } catch (apiError) {
        console.error('API call failed, falling back to localStorage:', apiError);

        // Fallback to localStorage if API fails
        if (!isAuthenticated()) {
          console.log('Using localStorage for non-authenticated user');
          // Use localStorage for non-authenticated users
          setCart(prevCart => {
            // Check if product already exists in cart
            const existingItemIndex = prevCart.findIndex(item => {
              const itemProductId = item.product_id || item.id;
              return itemProductId === productId;
            });
            console.log('Existing item index:', existingItemIndex);

            if (existingItemIndex >= 0) {
              console.log('Updating existing item');
              // Update quantity of existing item
              const updatedCart = [...prevCart];
              updatedCart[existingItemIndex].quantity += quantity;
              console.log('Updated cart:', updatedCart);
              return updatedCart;
            } else {
              console.log('Adding new item');
              // Add new item to cart
              const newCart = [...prevCart, {
                product_id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image_url: product.image_url,
                subtotal: product.price * quantity,
                stock_quantity: product.quantity // Store stock info for validation
              }];
              console.log('New cart:', newCart);
              return newCart;
            }
          });
        } else {
          console.error('API failed for authenticated user and localStorage fallback not available');
          setError('Failed to add item to cart. Please try again.');
        }
      }

      console.log('=== CART CONTEXT: ADD TO CART SUCCESS ===');
    } catch (err) {
      console.error('=== CART CONTEXT: ADD TO CART ERROR ===');
      console.error('Failed to add to cart:', err);
      console.error('Error message:', err.message);
      console.error('=== CART CONTEXT: ADD TO CART ERROR END ===');
      // Error is already set above, don't override it
      if (!error) {
        setError('Failed to add item to cart');
      }
    }
  };

  const updateQuantity = async (itemId, productId, quantity, stockQuantity = null) => {
    try {
      // Validate quantity
      if (quantity <= 0) {
        setError('Quantity must be at least 1');
        return;
      }

      // Find the cart item to get stock information
      const cartItem = cart.find(item => {
        const itemProductId = item.product_id || item.id;
        return itemProductId === productId;
      });

      // Use stock quantity from cart item or parameter
      const availableStock = stockQuantity || cartItem?.stock_quantity;

      if (availableStock && quantity > availableStock) {
        setError(`Only ${availableStock} items available in stock`);
        return;
      }

      if (isAuthenticated()) {
        // Use API for authenticated users
        await updateCartItem(itemId, quantity);

        // Refresh cart after updating
        const cartData = await getCart();
        setCart(cartData.items || []);
        setTotal(cartData.total || 0);
        setCount(cartData.count || 0);
      } else {
        // Use localStorage for non-authenticated users
        setCart(prevCart => {
          return prevCart.map(item => {
            if (item.product_id === productId) {
              return {
                ...item,
                quantity: quantity,
                subtotal: item.price * quantity
              };
            }
            return item;
          });
        });
      }
    } catch (err) {
      console.error('Failed to update cart item:', err);
      setError('Failed to update cart item');
    }
  };

  const removeFromCart = async (itemId, productId) => {
    try {
      if (isAuthenticated()) {
        // Use API for authenticated users
        await apiRemoveFromCart(itemId);

        // Refresh cart after removing item
        const cartData = await getCart();
        setCart(cartData.items || []);
        setTotal(cartData.total || 0);
        setCount(cartData.count || 0);
      } else {
        // Use localStorage for non-authenticated users
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      if (isAuthenticated()) {
        // Use API for authenticated users
        await apiClearCart();

        // Reset cart state
        setCart([]);
        setTotal(0);
        setCount(0);
      } else {
        // Use localStorage for non-authenticated users
        setCart([]);
        setTotal(0);
        setCount(0);
        localStorage.removeItem('cart');
      }
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError('Failed to clear cart');
    }
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + parseInt(item.quantity), 0);
  };

  const value = {
    cart,
    total,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
