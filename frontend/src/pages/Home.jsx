import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { processImageUrl, handleImageError } from '../utils/imageHelper'
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProducts({ limit: 100 }); // Get more products for better random selection
        const productsData = result.products || result; // Handle both old and new API format

        // Get 4 random products as featured
        const randomProducts = productsData
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setFeaturedProducts(randomProducts);

        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16 rounded-lg mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Yamaha RD Parts Shop</h1>
          <p className="text-xl mb-8">Quality parts for your classic Yamaha RD motorcycle</p>
          <Link
            to="/products"
            className="bg-white text-blue-800 px-6 py-3 rounded-lg font-bold hover:bg-blue-100 transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Shop by Category</h2>
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading categories..." variant="gear" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products/category/${category.id}`}
                className="bg-gray-100 p-6 rounded-lg text-center hover:bg-gray-200 transition duration-300"
              >
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Featured Products</h2>
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Loading featured products..." variant="gear" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {product.image_url ? (
                    <img
                      src={processImageUrl(product.image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">{product.category_name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-bold">${parseFloat(product.price).toFixed(2)}</span>
                    <Link
                      to={`/products/${product.id}`}
                      className="flex items-center justify-center bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-flex items-center bg-blue-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            View All Products
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-100 py-12 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">About Yamaha RD Parts</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg mb-4">
              We specialize in providing high-quality parts for classic Yamaha RD motorcycles.
              Whether you're restoring a vintage RD or maintaining your daily rider, we have the parts you need.
            </p>
            <p className="text-lg mb-4">
              Our inventory includes both new and carefully inspected used parts, ensuring you can find exactly what you need
              for your project at competitive prices.
            </p>
            <p className="text-lg">
              With over 15 years of experience in the motorcycle parts industry, we pride ourselves on our knowledge,
              customer service, and fast shipping.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
