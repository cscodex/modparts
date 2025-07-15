import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { processImageUrl, handleImageError } from '../utils/imageHelper';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, error: cartError } = useCart();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Handle cart errors
  useEffect(() => {
    if (cartError) {
      showError(cartError);
    }
  }, [cartError, showError]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      success(`${quantity} ${product.name} added to cart!`);
    } catch (error) {
      // Show the specific error message from the cart context
      const errorMessage = cartError || error.message || 'Failed to add item to cart';
      showError(errorMessage);
      console.error('Failed to add to cart:', error);
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product, quantity);
      navigate('/cart');
    } catch (error) {
      // Show the specific error message from the cart context
      const errorMessage = cartError || error.message || 'Failed to add item to cart';
      showError(errorMessage);
      console.error('Failed to add to cart for buy now:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="xl" text="Loading product details..." variant="gear" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-xl mb-4">Product not found</p>
        <Link to="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <Link to="/products" className="text-blue-600 hover:underline flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={processImageUrl(product.image_url)}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => handleImageError(e)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600">Category: {product.category_name}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                  {product.condition_status}
                </span>
                <span className={`text-sm font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <p className="text-3xl font-bold text-blue-800">
                ${parseFloat(product.price).toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            {product.quantity > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center">
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-l"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center border-t border-b py-1"
                  />
                  <button
                    className="bg-gray-200 px-3 py-1 rounded-r"
                    onClick={() => quantity < product.quantity && setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center bg-blue-800 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                disabled={product.quantity <= 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                disabled={product.quantity <= 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
