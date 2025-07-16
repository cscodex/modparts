import api from './config';

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    const categories = response.data.data || [];

    // Process categories to ensure consistent ID format and filter out null/invalid entries
    const processedCategories = categories
      .filter(category => category && category.id && category.name) // Filter out null/invalid entries
      .map(category => ({
        ...category,
        id: String(category.id), // Ensure ID is a string
        name: category.name.trim() // Trim whitespace from names
      }));

    // Remove duplicates by using a Map with category name as key
    // This ensures we don't have categories with the same name but different IDs
    const uniqueCategories = Array.from(
      new Map(processedCategories.map(category => [category.name.toLowerCase(), category])).values()
    );

    // Sort categories alphabetically by name
    uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));

    console.log('API - Fetched distinct categories:', uniqueCategories);
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};
