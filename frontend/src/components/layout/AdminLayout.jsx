import { Outlet } from 'react-router-dom';
import AdminTabs from '../admin/AdminTabs';

const AdminLayout = () => {
  return (
    <div className="bg-midnight-950 min-h-screen">
      {/* Admin Header with Tabs */}
      <div className="bg-midnight-900 border-b border-midnight-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Panel</h1>
        </div>
        <AdminTabs />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
