import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  });

  const [userProductDetails, setUserProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const getuserDatas = await axios.get('https://mock-backend-two.vercel.app/api/users-getall');
      const getproductDatas = await axios.get('https://mock-backend-two.vercel.app/api/products-getall');
      const getUserProductDetails = await axios.get('https://mock-backend-two.vercel.app/api/products-userdetails');
      
      console.log('User Data:', getuserDatas.data);
      console.log('Product Data:', getproductDatas.data);
      console.log('User Product Details:', getUserProductDetails.data);
      
      // Handle both array and object responses
      const usersData = getuserDatas.data?.data || getuserDatas.data;
      const productsData = getproductDatas.data?.data || getproductDatas.data;
      const userProductData = getUserProductDetails.data?.data || getUserProductDetails.data;
      
      const usersCount = Array.isArray(usersData) 
        ? usersData.length 
        : (usersData?.total || 0);
      const productsCount = Array.isArray(productsData) 
        ? productsData.length 
        : (productsData?.total || 0);
      
      // Calculate total orders and revenue from user product details
      const totalOrders = Array.isArray(userProductData) ? userProductData.length : 0;
      const totalRevenue = Array.isArray(userProductData) 
        ? userProductData.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0)
        : 0;
      
      setStats({
        totalUsers: usersCount,
        totalProducts: productsCount,
        totalOrders: totalOrders,
        revenue: totalRevenue,
      });
      
      // Set user product details for the table
      console.log('Setting user product details:', userProductData);
      setUserProductDetails(Array.isArray(userProductData) ? userProductData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl">
            📦
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Products</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalProducts}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
            🛒
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-2xl">
            💰
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Revenue</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
      </div>

      {/* User Purchase Details Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Recent Purchases</h3>
          <p className="text-sm text-slate-500 mt-1">Overview of user product purchases</p>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading purchase details...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {userProductDetails.length > 0 ? (
                  userProductDetails.map((item, index) => {
                    const total = (item.price || 0) * (item.quantity || 0);
                    return (
                      <tr 
                        key={item._id || index} 
                        className="border-t border-slate-100 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                              {item?.userDetails[0]?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item?.userDetails[0]?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item?.userDetails[0]?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📦</span>
                            <span className="text-sm font-medium text-slate-900">
                              {item.productName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900">
                            {formatCurrency(item.price || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.quantity || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-emerald-600">
                            {formatCurrency(total)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatDate(item.purchaseDate)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      No purchase records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Table Footer with Summary */}
        {userProductDetails.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                Showing {userProductDetails.length} purchase{userProductDetails.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Revenue</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.revenue)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;