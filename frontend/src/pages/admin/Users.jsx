import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useConfirm from '../../hooks/useConfirm';
import UserFormModal from '../../components/admin/UserFormModal';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import ProgressBar from '../../components/ui/ProgressBar';
import { exportToPDF, exportToXLSX } from '../../utils/exportUtils';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { success, error: showError } = useToast();
  const { isOpen, confirm, handleClose, handleConfirm, dialogProps } = useConfirm();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Export state
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null); // Reset error state

      try {
        const data = await getUsers();
        // Check if data is an array (successful response)
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && data.message) {
          // If we got a message property, it's probably an error
          setError(data.message);
          setUsers([]);
        } else {
          // Unexpected response format
          setError('Received unexpected data format from server');
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await confirm({
        title: 'Delete User',
        message: 'Are you sure you want to delete this user? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      });

      // If user confirms, proceed with deletion
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        success('User deleted successfully');
      } catch (err) {
        showError(err.message || 'Failed to delete user');
      }
    } catch {
      // User cancelled the dialog
      console.log('User deletion cancelled');
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editingUser) {
        // Update existing user
        await updateUser({ ...userData, id: editingUser.id });

        // Update local state
        setUsers(users.map(user =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        ));

        success('User updated successfully');
      } else {
        // Create new user
        await createUser(userData);

        // Refresh the user list to get the new user with ID
        const updatedUsers = await getUsers();
        setUsers(updatedUsers);

        success('User created successfully');
      }

      // Close modal
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save user');
    }
  };

  // Filter users by role and search query
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filtering
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Search filtering
      const userFullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const userEmail = (user.email || '').toLowerCase();
      const searchQueryLower = searchQuery.toLowerCase();

      const matchesSearch = userFullName.includes(searchQueryLower) ||
                           userEmail.includes(searchQueryLower);

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchQuery]);

  // Get current users for pagination
  // If itemsPerPage is -1, show all users
  const currentUsers = itemsPerPage === -1
    ? filteredUsers
    : filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

  // Calculate indices for display purposes
  const indexOfFirstUser = itemsPerPage === -1 ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastUser = itemsPerPage === -1 ? filteredUsers.length : Math.min(currentPage * itemsPerPage, filteredUsers.length);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      // Select all users on the current page
      setSelectedUsers(currentUsers.map(user => user.id));
    } else {
      // Deselect all users
      setSelectedUsers([]);
    }
  };

  // Handle individual user selection
  const handleSelectUser = (userId, isChecked) => {
    if (isChecked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      setSelectAll(false);
    }
  };

  // Handle bulk delete of selected users
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      showError('No users selected');
      return;
    }

    try {
      await confirm({
        title: 'Delete Selected Users',
        message: `Are you sure you want to delete ${selectedUsers.length} selected users? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
      });

      // If user confirms, proceed with deletion
      let successCount = 0;
      let errorCount = 0;

      for (const userId of selectedUsers) {
        try {
          await deleteUser(userId);
          successCount++;
        } catch (err) {
          console.error(`Error deleting user ${userId}:`, err);
          errorCount++;
        }
      }

      // Refresh user list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);

      // Reset selection
      setSelectedUsers([]);
      setSelectAll(false);

      if (errorCount === 0) {
        success(`Successfully deleted ${successCount} users`);
      } else {
        showError(`Deleted ${successCount} users, but failed to delete ${errorCount} users`);
      }
    } catch {
      // User cancelled the dialog
      console.log('Bulk deletion cancelled');
    }
  };

  // Handle export of selected users
  const handleExportSelected = async (format) => {
    if (selectedUsers.length === 0) {
      showError('No users selected');
      return;
    }

    // Get the selected users data
    const usersToExport = users.filter(user =>
      selectedUsers.includes(user.id)
    );

    if (format === 'pdf') {
      await handleExportToPDF(usersToExport);
    } else if (format === 'xlsx') {
      await handleExportToExcel(usersToExport);
    }
  };

  // Handle export to PDF
  const handleExportToPDF = async (usersToExport = null) => {
    // If no specific users are provided, export all filtered users
    let dataToExport = usersToExport || filteredUsers;

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
      console.log(`Preparing to export ${dataToExport.length} users to PDF`);

      // Define columns for PDF
      const columns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'Name', dataKey: 'fullName' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Phone', dataKey: 'phone' },
        { header: 'Role', dataKey: 'role' }
      ];

      // Format data for better display in PDF with error handling
      const formattedData = [];
      for (const user of dataToExport) {
        if (!user) continue;

        try {
          formattedData.push({
            id: user.id,
            fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
            email: user.email || 'No email',
            phone: user.phone || 'N/A',
            role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'
          });
        } catch (err) {
          console.error('Error formatting user data:', err, user);
        }
      }

      console.log(`Formatted ${formattedData.length} users for PDF export`);

      await exportToPDF(
        formattedData,
        columns,
        'users_export',
        'Users Report',
        setExportProgress
      );

      success('Users exported to PDF successfully');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      showError(`Failed to export users to PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export to Excel
  const handleExportToExcel = async (usersToExport = null) => {
    // If no specific users are provided, export all filtered users
    let dataToExport = usersToExport || filteredUsers;

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
      console.log(`Preparing to export ${dataToExport.length} users to Excel`);

      // Define columns for Excel
      const columns = [
        { header: 'ID', dataKey: 'id' },
        { header: 'First Name', dataKey: 'first_name' },
        { header: 'Last Name', dataKey: 'last_name' },
        { header: 'Email', dataKey: 'email' },
        { header: 'Phone', dataKey: 'phone' },
        { header: 'Address', dataKey: 'address' },
        { header: 'City', dataKey: 'city' },
        { header: 'State', dataKey: 'state' },
        { header: 'Zip Code', dataKey: 'zip_code' },
        { header: 'Role', dataKey: 'role' },
        { header: 'Created At', dataKey: 'created_at' },
        { header: 'Updated At', dataKey: 'updated_at' }
      ];

      // Format data for better display in Excel with error handling
      const formattedData = [];
      for (const user of dataToExport) {
        if (!user) continue;

        try {
          formattedData.push({
            id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || 'No email',
            phone: user.phone || 'N/A',
            address: user.address || 'N/A',
            city: user.city || 'N/A',
            state: user.state || 'N/A',
            zip_code: user.zip_code || 'N/A',
            role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer',
            created_at: user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A',
            updated_at: user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'
          });
        } catch (err) {
          console.error('Error formatting user data:', err, user);
        }
      }

      console.log(`Formatted ${formattedData.length} users for Excel export`);

      await exportToXLSX(
        formattedData,
        columns,
        'users_export',
        'Users',
        setExportProgress
      );

      success('Users exported to Excel successfully');
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showError(`Failed to export users to Excel: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={dialogProps.title}
          message={dialogProps.message}
          confirmText={dialogProps.confirmText}
          cancelText={dialogProps.cancelText}
          confirmButtonClass={dialogProps.confirmButtonClass}
        />

        {/* User Form Modal */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          user={editingUser}
        />

        {/* Export Progress Bar */}
        <ProgressBar
          progress={exportProgress}
          isVisible={isExporting}
          onComplete={() => setIsExporting(false)}
        />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Manage Users</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddUser}
              className="bg-midnight-700 text-midnight-50 px-4 py-2 rounded hover:bg-midnight-600 w-full sm:w-auto text-center"
              disabled={isExporting}
            >
              Add New User
            </button>
          </div>
        </div>

        <div className="bg-midnight-900 border border-midnight-700 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
            <div className="w-full md:w-1/3">
              <label className="block text-white mb-2">Filter by Role</label>
              <select
                className="w-full p-2 border border-midnight-600 bg-midnight-800 text-white rounded"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ color: 'white' }}
              >
                <option value="all" className="bg-midnight-800 text-white">All Roles</option>
                <option value="admin" className="bg-midnight-800 text-white">Admin</option>
                <option value="customer" className="bg-midnight-800 text-white">Customer</option>
              </select>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-white mb-2">Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full p-2 border border-midnight-600 bg-midnight-800 text-white rounded placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: 'white' }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="xl" text="Loading users..." variant="gear" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-midnight-900 border border-midnight-700 rounded-lg shadow">
            <p className="text-xl text-midnight-300 mb-6">No users found</p>
            <button
              onClick={handleAddUser}
              className="bg-midnight-700 text-midnight-50 px-6 py-3 rounded font-semibold hover:bg-midnight-600"
            >
              Add New User
            </button>
          </div>
        ) : (
          <div className="bg-midnight-900 border border-midnight-700 rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-midnight-800 border-b border-midnight-700">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="select-all-users"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-midnight-300 rounded border-midnight-600 bg-midnight-700 focus:ring-midnight-500"
                />
                <label htmlFor="select-all-users" className="text-sm font-medium text-midnight-200">
                Select All
              </label>
              <span className="text-sm text-gray-500">
                ({selectedUsers.length} selected)
              </span>
            </div>

            <div className="flex space-x-2">
              {selectedUsers.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    disabled={isExporting}
                  >
                    Delete Selected
                  </button>
                  <div className="relative">
                    <button
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                      onClick={() => document.getElementById('exportSelectedUsersDropdown').classList.toggle('hidden')}
                      disabled={isExporting}
                    >
                      <span>Export Selected</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div id="exportSelectedUsersDropdown" className="hidden absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10">
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
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-midnight-800">
                <tr>
                  <th className="p-4 w-10">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="text-left p-4 text-white min-w-[200px]">Name</th>
                  <th className="text-left p-4 text-white min-w-[200px]">Email</th>
                  <th className="text-center p-4 text-white min-w-[100px]">Role</th>
                  <th className="text-center p-4 text-white min-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.id} className="border-t border-midnight-700">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="h-4 w-4 text-midnight-300 rounded border-midnight-600 bg-midnight-700 focus:ring-midnight-500"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-white">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-300">{user.phone || 'No phone'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-white">{user.email}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Show pagination info even when no users are found */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
        </div>
      )}
    </div>
  );
};

export default Users;
