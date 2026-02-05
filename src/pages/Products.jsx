import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3060/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [rawProducts, setRawProducts] = useState([]); // Store original data for client-side filtering
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Client-side filtering
  const filteredProducts = rawProducts.filter((item) => {
    if (!searchTerm.trim()) return true;
    
    const buyer = item.userDetails?.[0];
    const name = buyer?.name?.toLowerCase() || '';
    const email = buyer?.email?.toLowerCase() || '';
    const productName = item.productName?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || 
           email.includes(search) || 
           productName.includes(search) || 
           category.includes(search);
  });

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Client-side filtering only - fetch all data
      const url = `${API_BASE_URL}/products-userdetails?page=${pagination.page}&limit=${pagination.limit}`;

      console.log('Fetching from:', url); // ← Check this in browser console!

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      let fetchedProducts = [];
      let total = 0;

      if (data?.data && Array.isArray(data.data)) {
        fetchedProducts = data.data;
        total = data.pagination?.total || fetchedProducts.length;

        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: data.pagination.page || prev.page,
            limit: data.pagination.limit || prev.limit,
            total: data.pagination.total || 0,
          }));
        }
      } else if (Array.isArray(data)) {
        fetchedProducts = data;
        total = data.length;
      }

      setRawProducts(fetchedProducts);
      setPagination((prev) => ({
        ...prev,
        total: total || fetchedProducts.length,
      }));
    } catch (error) {
      console.error('Fetch error:', error);
      setRawProducts([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    // fetch will trigger via useEffect
  };

  const handleReset = () => {
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    // fetch will trigger via useEffect
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Sold Products</h2>
      </div>

      {/* Search + Reset */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by buyer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading purchases...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-slate-50 rounded-xl">
          No purchases found {searchTerm && `(for "${searchTerm}")`}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((item) => {
              const buyer = item.userDetails?.[0];

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-grow">
                    <h3 className="font-semibold text-lg text-slate-900 mb-1 truncate">
                      {item.productName || 'Unnamed Product'}
                    </h3>

                    {buyer && (
                      <div className="mb-3 text-sm">
                        <p className="text-slate-700">
                          Purchased by <strong>{buyer.name}</strong>
                        </p>
                        <p className="text-slate-500">{buyer.email}</p>
                      </div>
                    )}

                    <p className="text-sm text-slate-500 mb-3">
                      {item.category || '—'}
                    </p>

                    <p className="text-xl font-bold text-indigo-600 mb-3">
                      ${Number(item.price || 0).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="text-sm text-slate-600">
                        Qty: <strong>{item.quantity ?? 0}</strong>
                      </span>
                    </div>

                    {item.purchaseDate && (
                      <p className="text-xs text-slate-500">
                        Purchased on: {new Date(item.purchaseDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-slate-600">
              Showing {filteredProducts.length} of {pagination.total} purchases
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-5 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-medium">Page {pagination.page}</span>
              <button
                disabled={
                  filteredProducts.length < pagination.limit ||
                  pagination.page * pagination.limit >= pagination.total
                }
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-5 py-2 border rounded-lg disabled:opacity-50 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Products;