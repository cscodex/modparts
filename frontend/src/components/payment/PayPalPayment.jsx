import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from '../../context/ToastContext';

const PayPalPayment = ({ amount, onSuccess, onError, customerInfo }) => {
  const { success, error: showError } = useToast();

  const initialOptions = {
    "client-id": "your-paypal-client-id-here",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount.toFixed(2),
          },
          shipping: {
            name: {
              full_name: `${customerInfo.firstName} ${customerInfo.lastName}`
            },
            address: {
              address_line_1: customerInfo.address,
              admin_area_2: customerInfo.city,
              admin_area_1: customerInfo.state,
              postal_code: customerInfo.zipCode,
              country_code: "US"
            }
          }
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      success('Payment completed successfully!');
      onSuccess(details);
    } catch (error) {
      showError('Payment failed. Please try again.');
      onError(error);
    }
  };

  const onErrorHandler = (err) => {
    showError('PayPal error occurred.');
    onError(err);
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="paypal-container">
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "paypal"
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalPayment;
