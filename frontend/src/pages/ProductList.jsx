import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getProducts, getProductsByCategory, searchProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { processImageUrl, handleImageError } from '../utils/imageHelper';
import RangeSlider from '../components/RangeSlider';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductList = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { success } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Price range state with fixed min and max values
  const [priceRange, setPriceRange] = useState({ min: 0, max: 99999 });
  const [currentPriceRange, setCurrentPriceRange] = useState({ min: 0, max: 99999 });

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState(
    categoryId ? [String(categoryId)] : []
  );

  // Availability filters - using checkboxes for multiple selection
  const [availabilityFilters, setAvailabilityFilters] = useState({
    inStock: false,
    outOfStock: false
  });

  const [sortOption, setSortOption] = useState('name-asc');

  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    availability: true,
    sortOptions: true
  });

  // Mobile filter visibility
  const [showFilters, setShowFilters] = useState(false);

  // For backward compatibility
  const [selectedCategory, setSelectedCategory] = useState(categoryId ? String(categoryId) : 'all');

  // Get search query from URL
  const searchQuery = new URLSearchParams(location.search).get('search');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();

        // The categories should already be unique from the API
        // But let's ensure all IDs are strings for consistent comparison
        const processedCategories = data.map(category => ({
          ...category,
          id: String(category.id)
        }));

        setCategories(processedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        let result;

        if (searchQuery) {
          console.log('📝 Using search API for query:', searchQuery);
          // For search, use the old API for now
          const data = await searchProducts(searchQuery);
          result = { products: data, pagination: null };
        } else if (categoryId) {
          console.log('📂 Using category API for category:', categoryId);
          // For category filtering, use the old API for now
          const data = await getProductsByCategory(categoryId);
          result = { products: data, pagination: null };

          // Ensure categoryId is stored as a string
          const categoryIdStr = String(categoryId);
          setSelectedCategory(categoryIdStr);

          // Update selectedCategories for the new multi-select filter
          setSelectedCategories([categoryIdStr]);
        } else {
          console.log('📄 Using paginated API for general listing');
          // Use new paginated API for general product listing with category filters
          result = await getProducts({
            page: currentPage,
            limit: itemsPerPage,
            sortBy: 'created_at',
            sortOrder: 'desc',
            categories: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined
          });
        }



        setProducts(result.products || []);
        setPagination(result.pagination);

        // We don't modify the price range min/max values based on products
        // They remain fixed at min: 0, max: 99999
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchQuery, currentPage, itemsPerPage, selectedCategories]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);

    // Reset price range to fixed min and max values
    const defaultRange = { min: 0, max: 99999 };
    setPriceRange(defaultRange);
    setCurrentPriceRange(defaultRange);

    // Reset availability filters
    setAvailabilityFilters({
      inStock: false,
      outOfStock: false
    });

    setSelectedCategory('all');
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // We'll use this directly in the onClick handler

  // Multi-select category filter handler
  const handleCategoryCheckboxChange = (categoryId) => {
    setSelectedCategories(prev => {
      // If category is already selected, remove it
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      // Otherwise add it
      return [...prev, categoryId];
    });
  };

  // Price range slider handler
  const handlePriceRangeChange = (values) => {
    setCurrentPriceRange(values);
  };

  // Apply price range when slider stops
  const handlePriceRangeApply = (values) => {
    setPriceRange(values);
  };

  // Availability filter handlers
  const handleAvailabilityChange = (filter) => {
    setAvailabilityFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  // Sort products
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };



  // Apply filters and sorting (category filtering is now done on backend)
  const filteredAndSortedProducts = [...products]
    .filter(product => {
      // Price range filtering
      const productPrice = parseFloat(product.price);
      const priceRangeFilter =
        productPrice >= priceRange.min &&
        productPrice <= priceRange.max;

      // Availability filtering with checkboxes
      let availabilityFilter = true;

      // If both checkboxes are checked or both are unchecked, show all products
      if (availabilityFilters.inStock && !availabilityFilters.outOfStock) {
        // Only show in-stock products
        availabilityFilter = product.quantity > 0;
      } else if (!availabilityFilters.inStock && availabilityFilters.outOfStock) {
        // Only show out-of-stock products
        availabilityFilter = product.quantity <= 0;
      }

      // Apply remaining filters (category filtering is handled by backend)
      return priceRangeFilter && availabilityFilter;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return 0;
      }
    });

  // Debug filtered results
  console.log('🔍 ProductList: After filtering:', {
    originalCount: products.length,
    filteredCount: filteredAndSortedProducts.length,
    sampleFiltered: filteredAndSortedProducts.slice(0, 2).map(p => ({ id: p.id, name: p.name }))
  });

  const handleAddToCart = (product) => {
    addToCart(product);
    success(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">
        {searchQuery
          ? `Search Results for "${searchQuery}"`
          : categoryId
            ? `${categories.find(c => c.id === categoryId)?.name || 'Category'} Parts`
            : 'All Products'}
      </h1>

      <div className="flex flex-col md:flex-row mb-8">
        {/* Filters */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-6">
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(prev => !prev)}
              className="w-full bg-blue-800 text-white py-2 px-4 rounded flex items-center justify-center"
            >
              <span className="mr-2">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className={`bg-white p-4 rounded shadow ${!showFilters && 'hidden md:block'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter - Multi-select Checkboxes */}
            <div className="mb-6 border-b pb-4">
              <button
                className="w-full flex justify-between items-center font-semibold text-gray-700 mb-2"
                onClick={() => toggleSection('categories')}
              >
                <span>Categories</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${expandedSections.categories ? 'transform rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {expandedSections.categories && (
                <div className="max-h-48 overflow-y-auto border rounded p-2 mt-2">
                  {categories.map(category => {
                    // Ensure category ID is a string
                    const categoryId = String(category.id);
                    return (
                      <div key={categoryId} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`category-${categoryId}`}
                          checked={selectedCategories.includes(categoryId)}
                          onChange={() => handleCategoryCheckboxChange(categoryId)}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${categoryId}`} className="text-sm">
                          {category.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Filter with Slider */}
            <div className="mb-6 border-b pb-4">
              <button
                className="w-full flex justify-between items-center font-semibold text-gray-700 mb-2"
                onClick={() => toggleSection('priceRange')}
              >
                <span>Price Range</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${expandedSections.priceRange ? 'transform rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {expandedSections.priceRange && (
                <div className="mt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">${currentPriceRange.min}</span>
                    <span className="text-sm font-medium">${currentPriceRange.max === 99999 ? 'Any' : currentPriceRange.max}</span>
                  </div>

                  {/* Custom Range Slider with two handles */}
                  <RangeSlider
                    min={0}
                    max={99999}
                    minValue={currentPriceRange.min}
                    maxValue={currentPriceRange.max}
                    onChange={handlePriceRangeChange}
                    onAfterChange={handlePriceRangeApply}
                  />

                  <div className="flex space-x-2 mt-4">
                    <div className="w-1/2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={currentPriceRange.min}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            const newMin = Math.max(0, Math.min(value, currentPriceRange.max - 1));
                            handlePriceRangeChange({
                              min: newMin,
                              max: currentPriceRange.max
                            });
                          }
                        }}
                        onBlur={() => handlePriceRangeApply(currentPriceRange)}
                        className="w-full p-2 border rounded text-sm"
                        min={0}
                        max={currentPriceRange.max - 1}
                      />
                    </div>
                    <div className="w-1/2">
                      <input
                        type="number"
                        placeholder="Max"
                        value={currentPriceRange.max}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value)) {
                            const newMax = Math.min(99999, Math.max(value, currentPriceRange.min + 1));
                            handlePriceRangeChange({
                              min: currentPriceRange.min,
                              max: newMax
                            });
                          }
                        }}
                        onBlur={() => handlePriceRangeApply(currentPriceRange)}
                        className="w-full p-2 border rounded text-sm"
                        min={currentPriceRange.min + 1}
                        max={99999}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Availability Filter - Checkboxes */}
            <div className="mb-6 border-b pb-4">
              <button
                className="w-full flex justify-between items-center font-semibold text-gray-700 mb-2"
                onClick={() => toggleSection('availability')}
              >
                <span>Availability</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${expandedSections.availability ? 'transform rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {expandedSections.availability && (
                <div className="space-y-2 mt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availability-in-stock"
                      checked={availabilityFilters.inStock}
                      onChange={() => handleAvailabilityChange('inStock')}
                      className="mr-2"
                    />
                    <label htmlFor="availability-in-stock" className="text-sm">In Stock</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availability-out-of-stock"
                      checked={availabilityFilters.outOfStock}
                      onChange={() => handleAvailabilityChange('outOfStock')}
                      className="mr-2"
                    />
                    <label htmlFor="availability-out-of-stock" className="text-sm">Out of Stock</label>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Options */}
            <div>
              <button
                className="w-full flex justify-between items-center font-semibold text-gray-700 mb-2"
                onClick={() => toggleSection('sortOptions')}
              >
                <span>Sort By</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform ${expandedSections.sortOptions ? 'transform rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {expandedSections.sortOptions && (
                <select
                  className="w-full p-2 border rounded mt-2"
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">
          {/* Active Filters Summary */}
          {(selectedCategories.length > 0 ||
            (priceRange.min !== 0 || priceRange.max !== 1000) ||
            availabilityFilters.inStock ||
            availabilityFilters.outOfStock) && (
            <div className="bg-gray-100 p-3 rounded mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-700">Active Filters:</span>

                {/* Category filters */}
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedCategories.map(catId => {
                      // Ensure catId is a string for consistent comparison
                      const strCatId = String(catId);
                      console.log(`Looking for category with ID: ${strCatId}`);

                      // Find the category by ID
                      const category = categories.find(c => String(c.id) === strCatId);
                      console.log(`Found category:`, category);

                      return category ? (
                        <span key={strCatId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                          {category.name}
                          <button
                            onClick={() => handleCategoryCheckboxChange(strCatId)}
                            className="ml-1 text-blue-800 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Price range filters */}
                {(priceRange.min > 0 || priceRange.max < 99999) && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                    Price: ${priceRange.min} - ${priceRange.max === 99999 ? 'Any' : priceRange.max}
                    <button
                      onClick={() => {
                        // Reset to default fixed range
                        const defaultRange = { min: 0, max: 99999 };
                        setPriceRange(defaultRange);
                        setCurrentPriceRange(defaultRange);
                      }}
                      className="ml-1 text-green-800 hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                )}

                {/* Availability filters */}
                {(availabilityFilters.inStock || availabilityFilters.outOfStock) && (
                  <div className="flex flex-wrap gap-1">
                    {availabilityFilters.inStock && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                        In Stock
                        <button
                          onClick={() => handleAvailabilityChange('inStock')}
                          className="ml-1 text-purple-800 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {availabilityFilters.outOfStock && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center">
                        Out of Stock
                        <button
                          onClick={() => handleAvailabilityChange('outOfStock')}
                          className="ml-1 text-purple-800 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-800 ml-auto"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="xl" text="Loading products..." variant="gear" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">No products available.</p>
              <p className="text-sm text-gray-500 mt-2">Check your internet connection or try refreshing the page.</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">No products match your filters.</p>
              <p className="text-sm text-gray-500 mt-2">
                Found {products.length} total products, but none match your current filters.
              </p>
              {(selectedCategories.length > 0 ||
                (priceRange.min > 0 || priceRange.max < 99999) ||
                availabilityFilters.inStock ||
                availabilityFilters.outOfStock) && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Clear all filters to see all {products.length} products
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'}
                {products.length > filteredAndSortedProducts.length && ` (filtered from ${products.length})`}
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                    {product.image_url ? (
                      <img
                        src={processImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => handleImageError(e)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span>No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category_name}</p>
                    <div className="flex items-center mb-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {product.condition_status}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <p className="text-blue-800 font-bold text-xl mb-3">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                    <div className="flex justify-between">
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={product.quantity <= 0}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - show when using backend pagination */}
            {!searchQuery && !categoryId && pagination && (
              <div className="mt-8">
                <Pagination
                  totalItems={pagination.totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />

                <div className="mt-4 text-sm text-gray-600 text-center">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} products
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
