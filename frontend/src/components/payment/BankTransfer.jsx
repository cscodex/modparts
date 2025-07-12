import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const BankTransfer = ({ amount, onSuccess, customerInfo }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  // Generate unique reference number
  const referenceNumber = `YRD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

  const bankDetails = {
    bankName: "First National Bank",
    accountName: "Yamaha RD Parts Ltd",
    accountNumber: "1234567890",
    routingNumber: "021000021",
    swiftCode: "FNBKUS33", // For international transfers
    reference: referenceNumber
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    
    setTimeout(() => {
      success('Order confirmed! Please complete the bank transfer to process your order.');
      onSuccess({
        payment_method: 'bank_transfer',
        payment_status: 'pending_payment',
        amount: amount,
        currency: 'USD',
        reference_number: referenceNumber,
        transaction_id: `BT_${referenceNumber}`
      });
      setLoading(false);
    }, 1000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-800">Bank Transfer</h3>
            <p className="text-blue-700">Transfer money directly to our bank account</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <span className="text-sm text-gray-600">Bank Name:</span>
              <p className="font-medium">{bankDetails.bankName}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(bankDetails.bankName)}
              className="text-blue-600 hover:text-blue-800"
            >
              📋
            </button>
          </div>

          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <span className="text-sm text-gray-600">Account Name:</span>
              <p className="font-medium">{bankDetails.accountName}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(bankDetails.accountName)}
              className="text-blue-600 hover:text-blue-800"
            >
              📋
            </button>
          </div>

          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <span className="text-sm text-gray-600">Account Number:</span>
              <p className="font-medium">{bankDetails.accountNumber}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(bankDetails.accountNumber)}
              className="text-blue-600 hover:text-blue-800"
            >
              📋
            </button>
          </div>

          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <span className="text-sm text-gray-600">Routing Number:</span>
              <p className="font-medium">{bankDetails.routingNumber}</p>
            </div>
            <button 
              onClick={() => copyToClipboard(bankDetails.routingNumber)}
              className="text-blue-600 hover:text-blue-800"
            >
              📋
            </button>
          </div>

          <div className="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200">
            <div>
              <span className="text-sm text-yellow-700">Reference Number:</span>
              <p className="font-bold text-yellow-800">{bankDetails.reference}</p>
              <p className="text-xs text-yellow-600">⚠️ Include this in transfer description</p>
            </div>
            <button 
              onClick={() => copyToClipboard(bankDetails.reference)}
              className="text-yellow-700 hover:text-yellow-900"
            >
              📋
            </button>
          </div>

          <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
            <div>
              <span className="text-sm text-green-700">Amount to Transfer:</span>
              <p className="font-bold text-green-800 text-lg">${amount.toFixed(2)} USD</p>
            </div>
            <button 
              onClick={() => copyToClipboard(amount.toFixed(2))}
              className="text-green-700 hover:text-green-900"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 mb-2">Transfer Instructions:</h4>
        <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
          <li>Log into your online banking or visit your bank</li>
          <li>Set up a new transfer to the account details above</li>
          <li>Enter the exact amount: <strong>${amount.toFixed(2)}</strong></li>
          <li>Include reference number: <strong>{bankDetails.reference}</strong></li>
          <li>Complete the transfer</li>
          <li>Your order will be processed within 1-2 business days</li>
        </ol>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-800 mb-2">Important:</h4>
        <ul className="text-sm text-red-700 space-y-1">
          <li>• Transfer fees may apply from your bank</li>
          <li>• International transfers may take 3-5 business days</li>
          <li>• Always include the reference number</li>
          <li>• Keep your transfer receipt for records</li>
        </ul>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="transfer-terms"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="h-4 w-4 text-blue-600"
        />
        <label htmlFor="transfer-terms" className="text-sm text-gray-700">
          I understand the transfer instructions and will complete the payment
        </label>
      </div>

      <button
        onClick={handleConfirmOrder}
        disabled={!confirmed || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          'Confirm Order - I Will Transfer the Money'
        )}
      </button>
    </div>
  );
};

export default BankTransfer;
