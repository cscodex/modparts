import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import ProgressBar from '../../components/ui/ProgressBar';
import { exportToPDF, exportToXLSX } from '../../utils/exportUtils';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const { success, error: showError } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Export state
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Selection state
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      success('Order status updated successfully');
    } catch (err) {
      showError(err.message || 'Failed to update order status');
    }
  };

  // Handle export to PDF
  const handleExportToPDF = async (ordersToExport = null) => {
    // If no specific orders are provided, export all filtered orders
    let dataToExport = ordersToExport || filteredOrders;

    try {
      setExportFormat('pdf');
      setIsExporting(true);
      setExportProgress(0);

      // Ensure dataToExport is an array
      if (!Array.isArray(dataToExport)) {
        console.error('dataToExport is not an array:', dataToExport);
        dataToExport = Array.isArray(dataToExport) ? dataToExport : (dataToExport ? [dataToExport] : []);
      }

      // Log data for debugging
      console.log(`Preparing to export ${dataToExport.length} orders to PDF`);

      // Define columns for PDF
      const columns = [
        { header: 'Order #', dataKey: 'id' },
        { header: 'Customer', dataKey: 'customer_name' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Date', dataKey: 'created_at' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Total', dataKey: 'total_amount' }
      ];

      // Format data for better display in PDF with error handling
      const formattedData = [];
      for (const order of dataToExport) {
        if (!order) continue;

        try {
          formattedData.push({
            ...order,
            customer_name: order.customer_name || 'Unknown',
            email: order.email || 'No email',
            created_at: order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
            total_amount: `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
            status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'
          });
        } catch (err) {
          console.error('Error formatting order data:', err, order);
        }
      }

      console.log(`Formatted ${formattedData.length} orders for PDF export`);

      await exportToPDF(
        formattedData,
        columns,
        'orders_export',
        'Orders Report',
        setExportProgress
      );

      success('Orders exported to PDF successfully');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      showError(`Failed to export orders to PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export to Excel
  const handleExportToExcel = async (ordersToExport = null) => {
    // If no specific orders are provided, export all filtered orders
    let dataToExport = ordersToExport || filteredOrders;

    try {
      setExportFormat('xlsx');
      setIsExporting(true);
      setExportProgress(0);

      // Ensure dataToExport is an array
      if (!Array.isArray(dataToExport)) {
        console.error('dataToExport is not an array:', dataToExport);
        dataToExport = Array.isArray(dataToExport) ? dataToExport : (dataToExport ? [dataToExport] : []);
      }

      // Log data for debugging
      console.log(`Preparing to export ${dataToExport.length} orders to Excel`);

      // Define columns for Excel
      const columns = [
        { header: 'Order #', dataKey: 'id' },
        { header: 'Customer', dataKey: 'customer_name' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Phone', dataKey: 'phone' },
        { header: 'Address', dataKey: 'shipping_address' },
        { header: 'Date', dataKey: 'created_at' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Payment Method', dataKey: 'payment_method' },
        { header: 'Total', dataKey: 'total_amount' }
      ];

      // Format data for better display in Excel with error handling
      const formattedData = [];
      for (const order of dataToExport) {
        if (!order) continue;

        try {
          formattedData.push({
            ...order,
            customer_name: order.customer_name || 'Unknown',
            email: order.email || 'No email',
            phone: order.phone || 'No phone',
            shipping_address: order.shipping_address || 'No address',
            created_at: order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString(),
            total_amount: parseFloat(order.total_amount || 0).toFixed(2),
            status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending',
            payment_method: order.payment_method || 'Unknown'
          });
        } catch (err) {
          console.error('Error formatting order data:', err, order);
        }
      }

      console.log(`Formatted ${formattedData.length} orders for Excel export`);

      await exportToXLSX(
        formattedData,
        columns,
        'orders_export',
        'Orders',
        setExportProgress
      );

      success('Orders exported to Excel successfully');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showError(`Failed to export orders to Excel: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    return statusFilter === 'all'
      ? orders
      : orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Get current orders for pagination
  // If itemsPerPage is -1, show all orders
  const currentOrders = itemsPerPage === -1
    ? filteredOrders
    : filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  // Calculate indices for display purposes
  const indexOfFirstOrder = itemsPerPage === -1 ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastOrder = itemsPerPage === -1 ? filteredOrders.length : Math.min(currentPage * itemsPerPage, filteredOrders.length);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      // Select all orders on the current page
      setSelectedOrders(currentOrders.map(order => order.id));
    } else {
      // Deselect all orders
      setSelectedOrders([]);
    }
  };

  // Handle individual order selection
  const handleSelectOrder = (orderId, isChecked) => {
    if (isChecked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
      setSelectAll(false);
    }
  };

  // Handle export of selected orders
  const handleExportSelected = async (format) => {
    if (selectedOrders.length === 0) {
      showError('No orders selected');
      return;
    }

    // Get the selected orders data
    const ordersToExport = orders.filter(order =>
      selectedOrders.includes(order.id)
    );

    if (format === 'pdf') {
      await handleExportToPDF(ordersToExport);
    } else if (format === 'xlsx') {
      await handleExportToExcel(ordersToExport);
    }
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4">
      {/* Export Progress Bar */}
      <ProgressBar
        progress={exportProgress}
        isVisible={isExporting}
        onComplete={() => setIsExporting(false)}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <label className="block text-gray-700 mb-2">Filter by Status</label>
            <select
              className="p-2 border rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="select-all-orders"
                checked={selectAll}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="select-all-orders" className="text-sm font-medium text-gray-700">
                Select All
              </label>
              <span className="text-sm text-gray-500">
                ({selectedOrders.length} selected)
              </span>
            </div>

            <div className="flex space-x-2">
              {selectedOrders.length > 0 && (
                <div className="relative">
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                    onClick={() => document.getElementById('exportSelectedOrdersDropdown').classList.toggle('hidden')}
                    disabled={isExporting}
                  >
                    <span>Export Selected</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div id="exportSelectedOrdersDropdown" className="hidden absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleExportSelected('pdf')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={isExporting}
                      >
                        Export to PDF
                      </button>
                      <button
                        onClick={() => handleExportSelected('xlsx')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        disabled={isExporting}
                      >
                        Export to Excel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 w-10">
                  <span className="sr-only">Select</span>
                </th>
                <th className="text-left p-4">Order #</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Date</th>
                <th className="text-center p-4">Status</th>
                <th className="text-right p-4">Total</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4 font-semibold">#{order.id}</td>
                  <td className="p-4">
                    <div>
                      <p>{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.email}</p>
                    </div>
                  </td>
                  <td className="p-4">{new Date(order.created_at || Date.now()).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <select
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status && typeof order.status === 'string' ? order.status : 'pending')}`}
                      value={order.status && typeof order.status === 'string' ? order.status : 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => window.open(`/orders/${order.id}?print=true`, '_blank')}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Generate Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Show pagination info even when no orders are found */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
        </div>
      )}
    </div>
  );
};

export default Orders;
