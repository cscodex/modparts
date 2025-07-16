import { Outlet } from 'react-router-dom';
import Sidebar from '../admin/Sidebar';

const AdminLayout = () => {
  return (
    <div className="bg-midnight-950 min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
