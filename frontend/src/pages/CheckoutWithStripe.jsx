import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../api/orders';
import { getUserProfile } from '../api/auth';
import StripePayment from '../components/payment/StripePayment';

const CheckoutWithStripe = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zip_code || '',
    phone: user?.phone || '',
    paymentMethod: 'stripe'
  });

  const [step, setStep] = useState(1); // 1: Shipping Info, 2: Payment
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const profileData = await getUserProfile();
        setFormData(prevData => ({
          ...prevData,
          firstName: profileData.first_name || user.first_name || '',
          lastName: profileData.last_name || user.last_name || '',
          email: profileData.email || user.email || '',
          address: profileData.address || user.address || '',
          city: profileData.city || user.city || '',
          state: profileData.state || user.state || '',
          zipCode: profileData.zip_code || user.zip_code || '',
          phone: profileData.phone || user.phone || ''
        }));
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2); // Move to payment step
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setLoading(true);
    try {
      // Prepare order data
      const orderItems = cart.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const shippingAddress = `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, Phone: ${formData.phone}`;

      const orderData = {
        items: orderItems,
        total_amount: total,
        shipping_address: shippingAddress,
        payment_method: 'stripe',
        payment_intent_id: paymentIntent.id,
        payment_status: 'paid',
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        phone: formData.phone
      };

      // Create order
      const response = await createOrder(orderData);
      
      if (!response || !response.order_id) {
        throw new Error('Invalid response from server');
      }

      // Clear cart and redirect
      await clearCart();
      success('Order placed successfully! Payment confirmed.');
      navigate(`/order-confirmation/${response.order_id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      showError('Order creation failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    showError('Payment failed. Please try again.');
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          {step === 1 ? (
            // Shipping Information Step
            <form onSubmit={handleShippingSubmit}>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 text-white py-3 rounded font-semibold hover:bg-blue-700"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          ) : (
            // Payment Step
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Back to Shipping
                </button>
                <h2 className="text-xl font-bold">Payment Information</h2>
              </div>

              <StripePayment
                amount={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                customerInfo={formData}
              />
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWithStripe;
