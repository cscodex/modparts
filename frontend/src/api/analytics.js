// Financial Analytics API Service
// Frontend service for fetching financial reporting data

import { API_URL } from './config';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Base API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Financial Overview Analytics
export const getFinancialOverview = async (period = 30) => {
  try {
    console.log(`📊 Fetching financial overview for ${period} days`);
    
    const response = await apiRequest(`/analytics/financial?period=${period}&type=overview`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch financial overview');
    }
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    throw error;
  }
};

// Revenue Analytics
export const getRevenueAnalytics = async (period = 30) => {
  try {
    console.log(`📈 Fetching revenue analytics for ${period} days`);
    
    const response = await apiRequest(`/analytics/financial?period=${period}&type=revenue`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch revenue analytics');
    }
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

// Order Analytics
export const getOrderAnalytics = async (period = 30) => {
  try {
    console.log(`📦 Fetching order analytics for ${period} days`);
    
    const response = await apiRequest(`/analytics/financial?period=${period}&type=orders`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch order analytics');
    }
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
};

// Product Performance Analytics
export const getProductAnalytics = async (period = 30) => {
  try {
    console.log(`🛍️ Fetching product analytics for ${period} days`);
    
    const response = await apiRequest(`/analytics/financial?period=${period}&type=products`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch product analytics');
    }
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    throw error;
  }
};

// Customer Analytics
export const getCustomerAnalytics = async (period = 30) => {
  try {
    console.log(`👥 Fetching customer analytics for ${period} days`);
    
    const response = await apiRequest(`/analytics/financial?period=${period}&type=customers`);
    
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch customer analytics');
    }
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    throw error;
  }
};

// Export Financial Data
export const exportFinancialData = async (period = 30, format = 'json') => {
  try {
    console.log(`📤 Exporting financial data for ${period} days in ${format} format`);
    
    const response = await apiRequest(`/analytics/financial?period=${period}&type=export`);
    
    if (response.success) {
      if (format === 'csv') {
        return convertToCSV(response.data, response.summary);
      }
      return response;
    } else {
      throw new Error(response.message || 'Failed to export financial data');
    }
  } catch (error) {
    console.error('Error exporting financial data:', error);
    throw error;
  }
};

// Convert data to CSV format
const convertToCSV = (data, summary) => {
  if (!data || data.length === 0) {
    return 'No data available for the selected period';
  }

  // CSV headers
  const headers = Object.keys(data[0]).join(',');
  
  // CSV rows
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value
    ).join(',')
  );

  // Summary information
  const summaryRows = [
    '',
    'SUMMARY',
    `Total Orders,${summary.totalOrders}`,
    `Total Revenue,$${summary.totalRevenue.toFixed(2)}`,
    `Date Range,${summary.dateRange.startDate} to ${summary.dateRange.endDate}`
  ];

  return [headers, ...rows, ...summaryRows].join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent, filename = 'financial_report.csv') => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Get sales trends for charts
export const getSalesTrends = async (period = 30) => {
  try {
    const [overview, revenue] = await Promise.all([
      getFinancialOverview(period),
      getRevenueAnalytics(period)
    ]);

    return {
      dailyRevenue: overview.trends.dailyRevenue,
      monthlyRevenue: revenue.monthlyRevenue,
      revenueGrowth: revenue.revenueGrowth,
      paymentMethods: overview.trends.revenueByPaymentMethod
    };
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    throw error;
  }
};

// Get key performance indicators
export const getKPIs = async (period = 30) => {
  try {
    const [overview, orders, customers] = await Promise.all([
      getFinancialOverview(period),
      getOrderAnalytics(period),
      getCustomerAnalytics(period)
    ]);

    return {
      totalRevenue: overview.revenue.total,
      completedRevenue: overview.revenue.completed,
      pendingRevenue: overview.revenue.pending,
      averageOrderValue: overview.revenue.averageOrderValue,
      totalOrders: overview.orders.total,
      completedOrders: overview.orders.completed,
      pendingOrders: overview.orders.pending,
      conversionRate: overview.orders.total > 0 ? (overview.orders.completed / overview.orders.total) * 100 : 0,
      totalCustomers: customers.metrics.totalCustomers,
      averageCustomerValue: customers.metrics.averageCustomerValue,
      averageFulfillmentTime: orders.fulfillmentMetrics.averageFulfillmentTime
    };
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    throw error;
  }
};

// Format currency for display
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// Format percentage for display
export const formatPercentage = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

// Format number with commas
export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value || 0);
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Get date range options for analytics
export const getDateRangeOptions = () => {
  return [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 3 months' },
    { value: 180, label: 'Last 6 months' },
    { value: 365, label: 'Last year' }
  ];
};

// Validate analytics data
export const validateAnalyticsData = (data) => {
  if (!data) {
    throw new Error('No analytics data provided');
  }

  // Check for required fields based on data type
  const requiredFields = {
    overview: ['revenue', 'orders', 'trends'],
    revenue: ['monthlyRevenue', 'revenueGrowth'],
    orders: ['statusDistribution', 'fulfillmentMetrics'],
    products: ['topProducts'],
    customers: ['topCustomers', 'metrics']
  };

  // Basic validation - can be extended based on specific requirements
  return true;
};

// Error handling wrapper for analytics functions
export const withErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Analytics function error:`, error);
      
      // Return default/empty data structure instead of throwing
      return {
        error: true,
        message: error.message,
        data: null
      };
    }
  };
};
