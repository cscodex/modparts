import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../api/orders';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/orders" className="text-blue-600 hover:underline">
          View All Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-xl mb-4">Order not found</p>
        <Link to="/orders" className="text-blue-600 hover:underline">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg mb-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-lg">Thank you for your purchase.</p>
          <p className="text-lg">Your order number is: <span className="font-semibold">#{order.id || 'N/A'}</span></p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <p>Order Date & Time: {new Date(order.created_at || Date.now()).toLocaleString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}</p>
              <p>Status: <span className="capitalize">{order.status || 'pending'}</span></p>
              <p>Payment Method: {order.payment_method ? order.payment_method.replace('_', ' ') : 'Not specified'}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p>{order.shipping_address || 'No shipping address provided'}</p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">Order Items</h3>
          <div className="border rounded overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Product</th>
                  <th className="text-center p-3">Price</th>
                  <th className="text-center p-3">Quantity</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.product_name || 'Unknown Product'}</td>
                      <td className="p-3 text-center">${parseFloat(item.price || 0).toFixed(2)}</td>
                      <td className="p-3 text-center">{item.quantity || 1}</td>
                      <td className="p-3 text-right">${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td colSpan="4" className="p-3 text-center text-gray-500">No items found for this order</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="border-t">
                  <td colSpan="3" className="p-3 text-right font-semibold">Total:</td>
                  <td className="p-3 text-right font-bold">${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-between">
          <Link
            to="/products"
            className="bg-blue-800 text-white px-6 py-3 rounded font-semibold hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded font-semibold hover:bg-gray-300"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
