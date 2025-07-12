import api from './config';
import axios from 'axios';

// Function to upload product image
export const uploadProductImage = async (file) => {
  try {
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    const formData = new FormData();
    formData.append('image', file);

    // Log FormData (for debugging)
    console.log('FormData created with file');

    // Get auth token from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token || '';

    console.log('Using auth token:', token ? 'Token exists' : 'No token');

    const headers = {
      'Content-Type': 'multipart/form-data'
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('Sending upload request with headers:', headers);

    const response = await axios.post('/Modparts/api/upload.php', formData, {
      headers,
      withCredentials: true
    });

    console.log('Upload response:', response.data);

    // Handle case where response contains PHP warnings mixed with JSON
    let jsonData = response.data;

    // If the response is a string and contains both HTML and JSON
    if (typeof response.data === 'string' && response.data.includes('<br />') && response.data.includes('{"message"')) {
      try {
        // Extract the JSON part from the response
        const jsonStart = response.data.indexOf('{');
        const jsonString = response.data.substring(jsonStart);
        jsonData = JSON.parse(jsonString);
        console.log('Extracted JSON from response:', jsonData);
      } catch (parseError) {
        console.error('Error parsing JSON from response:', parseError);
        throw new Error('Invalid response format from server');
      }
    }

    if (!jsonData || !jsonData.file_url) {
      console.error('Invalid response format:', jsonData);
      throw new Error('Invalid response from server');
    }

    return jsonData;
  } catch (error) {
    console.error('Error uploading image:', error);
    console.error('Error details:', error.response?.data || 'No response data');
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

export const getProducts = async () => {
  try {
    const response = await api.get('/products');

    // Process products to ensure category_id is a string for consistent comparison
    const products = response.data.data || [];
    const processedProducts = products.map(product => ({
      ...product,
      category_id: String(product.category_id) // Ensure category_id is a string
    }));

    console.log(`Fetched ${processedProducts.length} products`);
    return processedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    // Ensure categoryId is properly formatted
    const formattedCategoryId = String(categoryId);
    console.log(`Fetching products for category ID: ${formattedCategoryId}`);

    const response = await api.get(`/products?category_id=${formattedCategoryId}`);

    // Process products to ensure category_id is a string for consistent comparison
    const products = response.data.data || [];
    const processedProducts = products.map(product => ({
      ...product,
      category_id: String(product.category_id) // Ensure category_id is a string
    }));

    console.log(`Found ${processedProducts.length} products for category ${formattedCategoryId}`);
    return processedProducts;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await api.get(`/products?search=${query}`);

    // Process products to ensure category_id is a string for consistent comparison
    const products = response.data.data || [];
    const processedProducts = products.map(product => ({
      ...product,
      category_id: String(product.category_id) // Ensure category_id is a string
    }));

    console.log(`Search found ${processedProducts.length} products for query "${query}"`);
    return processedProducts;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

export const updateProduct = async (productData) => {
  try {
    const response = await api.put(`/products/${productData.id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

/**
 * Create multiple products at once (bulk import)
 *
 * @param {Array} productsData - Array of product objects to create
 * @returns {Promise<Array>} - Array of created products
 */
export const bulkCreateProducts = async (productsData) => {
  try {
    // Since we don't have a specific bulk create endpoint, we'll create products one by one
    const createdProducts = [];

    for (const productData of productsData) {
      try {
        const response = await createProduct(productData);
        createdProducts.push(response);
      } catch (error) {
        console.error(`Error creating product ${productData.name}:`, error);
        // Continue with the next product even if one fails
      }
    }

    return createdProducts;
  } catch (error) {
    console.error('Error in bulk product creation:', error);
    throw new Error(error.message || 'Failed to import products');
  }
};

/**
 * Get current stock for a product
 *
 * @param {number} productId - Product ID
 * @returns {Promise<number>} - Current stock quantity
 */
export const getProductStock = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data.data.quantity || 0;
  } catch (error) {
    console.error('Error fetching product stock:', error);
    throw new Error('Failed to fetch product stock');
  }
};

/**
 * Validate stock availability for cart operations
 *
 * @param {number} productId - Product ID
 * @param {number} requestedQuantity - Requested quantity
 * @returns {Promise<boolean>} - True if stock is available
 */
export const validateStock = async (productId, requestedQuantity) => {
  try {
    const currentStock = await getProductStock(productId);

    if (currentStock <= 0) {
      throw new Error('Product is out of stock');
    }

    if (requestedQuantity > currentStock) {
      throw new Error(`Only ${currentStock} items available in stock`);
    }

    return true;
  } catch (error) {
    console.error('Stock validation error:', error);
    throw error;
  }
};
