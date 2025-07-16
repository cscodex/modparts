import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="bg-midnight-950 min-h-screen">
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
