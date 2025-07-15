import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../api/config';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Invalid verification link. No token provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        if (response.data.already_verified) {
          setAlreadyVerified(true);
          success('Email already verified! You can now login.');
        } else {
          setVerified(true);
          success('Email verified successfully! Welcome to Sardaarji Auto Parts!');
          
          // Auto-login the user with the provided token
          if (response.data.token) {
            const userData = {
              user: response.data.user,
              token: response.data.token
            };
            login(userData);
            
            // Redirect to products page after a short delay
            setTimeout(() => {
              navigate('/products');
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Email verification error:', err);
        const errorData = err.response?.data;
        
        if (errorData?.expired) {
          setExpired(true);
          setError('Verification link has expired. Please request a new verification email.');
        } else {
          setError(errorData?.message || 'Email verification failed. Please try again.');
        }
        showError(errorData?.message || 'Email verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, login, navigate, success, showError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Verifying your email..." variant="gear" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {verified && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Verified Successfully! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Welcome to Sardaarji Auto Parts! Your account is now active and you're being logged in.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to products page...
              </p>
            </div>
          )}

          {alreadyVerified && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Already Verified ✅
              </h3>
              <p className="text-gray-600 mb-4">
                Your email is already verified. You can login to your account.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </Link>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
              
              {expired && (
                <div className="space-y-3">
                  <Link
                    to="/resend-verification"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Request New Verification Email
                  </Link>
                </div>
              )}
              
              <div className="mt-4">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
