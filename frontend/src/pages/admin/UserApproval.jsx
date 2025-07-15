import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../api/config';

const UserApproval = () => {
  const { success, error: showError } = useToast();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [migrationRequired, setMigrationRequired] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/user-approval');
      setPendingUsers(response.data.data || []);
      setMigrationRequired(false);
    } catch (err) {
      console.error('Error fetching pending users:', err);

      if (err.response?.data?.migration_required) {
        setMigrationRequired(true);
        showError('Database migration required. Please run the SQL script first.');
      } else {
        showError(err.response?.data?.message || 'Failed to fetch pending users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const response = await api.post('/admin/user-approval', {
        user_id: userId,
        action,
        reason
      });

      success(response.data.message);
      
      // Remove user from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      showError(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading pending users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Approval</h1>
        <div className="text-sm text-gray-500">
          {pendingUsers.length} pending approval{pendingUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {migrationRequired ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Database Migration Required</h3>
          <p className="text-gray-600 mb-4">
            The user approval system requires database changes. Please run the SQL migration script in Supabase.
          </p>
          <div className="bg-gray-100 rounded p-4 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">Steps to fix:</p>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Go to Supabase Dashboard → SQL Editor</li>
              <li>2. Copy and paste the SQL from <code>add-user-approval-system.sql</code></li>
              <li>3. Click "Run" to execute the migration</li>
              <li>4. Refresh this page</li>
            </ol>
          </div>
          <button
            onClick={fetchPendingUsers}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry After Migration
          </button>
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">No users are currently pending approval.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pendingUsers.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">📞 {user.phone}</p>
                        )}
                        {user.address && (
                          <p className="text-sm text-gray-500">📍 {user.address}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Registered: {formatDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUserAction(user.id, 'approve')}
                      disabled={actionLoading[user.id]}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {actionLoading[user.id] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Approve
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleUserAction(user.id, 'reject', 'Account rejected by admin')}
                      disabled={actionLoading[user.id]}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {actionLoading[user.id] ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserApproval;
