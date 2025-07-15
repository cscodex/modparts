import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../../api/dashboard';
import { forceReload } from '../../utils/cache';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Added console log to verify component update
console.log('Dashboard component loaded - version with all links - updated with cache control');

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="xl" text="Loading dashboard data..." variant="gear" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <a
              href="/Modparts/restart.php"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restart Server
            </a>
            <button
              onClick={forceReload}
              className="flex items-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cache & Reload
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/products"
            className="flex items-center bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Orders
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Manage Users
          </Link>

        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{dashboardData.total_products}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{dashboardData.total_orders}</p>

              {/* Order status counts */}
              <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
                  <span className="text-gray-600">Pending: </span>
                  <span className="ml-1 font-semibold">{dashboardData.orders_by_status.pending}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
                  <span className="text-gray-600">Processing: </span>
                  <span className="ml-1 font-semibold">{dashboardData.orders_by_status.processing}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
                  <span className="text-gray-600">Shipped: </span>
                  <span className="ml-1 font-semibold">{dashboardData.orders_by_status.shipped}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                  <span className="text-gray-600">Delivered: </span>
                  <span className="ml-1 font-semibold">{dashboardData.orders_by_status.delivered}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span>
                  <span className="text-gray-600">Cancelled: </span>
                  <span className="ml-1 font-semibold">{dashboardData.orders_by_status.cancelled}</span>
                </div>
              </div>

              {/* Visual bar chart representation */}
              <div className="mt-3 space-y-1.5">
                {dashboardData.total_orders > 0 ? (
                  <>
                    <div className="flex items-center text-xs">
                      <div className="w-16 text-gray-600">Pending</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${(dashboardData.orders_by_status.pending / dashboardData.total_orders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-16 text-gray-600">Processing</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400"
                          style={{ width: `${(dashboardData.orders_by_status.processing / dashboardData.total_orders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-16 text-gray-600">Shipped</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400"
                          style={{ width: `${(dashboardData.orders_by_status.shipped / dashboardData.total_orders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-16 text-gray-600">Delivered</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400"
                          style={{ width: `${(dashboardData.orders_by_status.delivered / dashboardData.total_orders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-16 text-gray-600">Cancelled</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400"
                          style={{ width: `${(dashboardData.orders_by_status.cancelled / dashboardData.total_orders) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">No orders to display</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold">{dashboardData.total_customers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${parseFloat(dashboardData.total_revenue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recents Orders</h2>
          </div>
          <div className="p-6">
            {dashboardData.recent_orders.length === 0 ? (
              <p className="text-gray-500">No recent orders</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Order #</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_orders.map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="p-2">
                          <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="p-2">{order.first_name} {order.last_name}</td>
                        <td className="p-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            !order.status || typeof order.status !== 'string' ? 'bg-gray-100 text-gray-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status && typeof order.status === 'string' && order.status.length > 0
                              ? (order.status.charAt(0).toUpperCase() + order.status.slice(1))
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="p-2 text-right">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-right">
              <Link to="/admin/orders" className="text-blue-600 hover:underline">
                View All Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Low Stock Products</h2>
          </div>
          <div className="p-6">
            {dashboardData.low_stock.length === 0 ? (
              <p className="text-gray-500">No low stock products</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Stock</th>
                      <th className="text-center p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.low_stock.map(product => (
                      <tr key={product.id} className="border-t">
                        <td className="p-2">
                          <Link to={`/admin/products/edit/${product.id}`} className="text-blue-600 hover:underline">
                            {product.name}
                          </Link>
                        </td>
                        <td className="p-2 text-right">
                          <span className={`font-semibold ${product.quantity <= 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            Update Stock
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 text-right">
              <Link to="/admin/products" className="text-blue-600 hover:underline">
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
