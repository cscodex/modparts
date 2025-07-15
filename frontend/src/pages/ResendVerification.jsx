import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../api/config';

const ResendVerification = () => {
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      setSent(true);
      success('Verification email sent! Please check your inbox.');
      
    } catch (err) {
      console.error('Resend verification error:', err);
      const errorData = err.response?.data;
      
      if (err.response?.status === 429) {
        setRetryAfter(errorData?.retry_after || 60);
        showError(errorData?.message || 'Please wait before requesting another email');
      } else {
        showError(errorData?.message || 'Failed to send verification email');
      }
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for retry
  useState(() => {
    if (retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address to receive a new verification link
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email address"
                  disabled={loading || retryAfter > 0}
                />
              </div>

              {retryAfter > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    Please wait {retryAfter} seconds before requesting another email.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || retryAfter > 0}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" text="Sending..." />
                  ) : retryAfter > 0 ? (
                    `Wait ${retryAfter}s`
                  ) : (
                    'Send Verification Email'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification Email Sent! 📧
              </h3>
              <p className="text-gray-600 mb-4">
                We've sent a new verification email to <strong>{email}</strong>. 
                Please check your inbox and click the verification link.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Don't see the email? Check your spam folder.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Send to a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
