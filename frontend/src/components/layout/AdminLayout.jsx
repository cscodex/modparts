import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="container mx-auto px-4">
      <Outlet />
    </div>
  );
};

export default AdminLayout;
