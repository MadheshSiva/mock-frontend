import { Outlet, Link, useLocation } from 'react-router-dom';

function AdminLayout() {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/products', label: 'Sold Products', icon: '📦' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-indigo-950 text-white flex flex-col fixed h-full left-0 top-0 z-50">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3.5 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 border-l-4 border-transparent ${
                location.pathname === item.path ? 'bg-white/10 text-white border-indigo-500' : ''
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>👤</span>
            <span>Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
