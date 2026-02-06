import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = 'https://mock-backend-two.vercel.app/api';

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

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    productName: '',
    price: '',
    quantity: '',
    purchaseDate: '',
  });
  const [formErrors, setFormErrors] = useState({});

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

      console.log('Fetching from:', url);

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

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${API_BASE_URL}/users-getall`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Users Response:', data);

      // Handle different response formats
      if (data?.data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    fetchUsers();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      userId: '',
      productName: '',
      price: '',
      quantity: '',
      purchaseDate: today,
    });
    setFormErrors({});
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
    fetchUsers();
    
    // Pre-fill form with existing product data
    const purchaseDate = product.purchaseDate 
      ? new Date(product.purchaseDate).toISOString().split('T')[0] 
      : '';
    
    setFormData({
      userId: product.userId || (product.userDetails?.[0]?._id || ''),
      productName: product.productName || '',
      price: product.price || '',
      quantity: product.quantity || '',
      purchaseDate: purchaseDate,
    });
    setFormErrors({});
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setFormData({
      userId: '',
      productName: '',
      price: '',
      quantity: '',
      purchaseDate: '',
    });
    setFormErrors({});
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      userId: '',
      productName: '',
      price: '',
      quantity: '',
      purchaseDate: '',
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.userId) {
      errors.userId = 'Please select a user';
    }
    if (!formData.productName.trim()) {
      errors.productName = 'Product name is required';
    }
    if (!formData.price || Number(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.purchaseDate) {
      errors.purchaseDate = 'Purchase date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const toastId = toast.loading("Creating product...");

    try {
      setSubmitting(true);

      const payload = {
        userId: formData.userId,
        productName: formData.productName.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        purchaseDate: formData.purchaseDate,
      };

      console.log('Submitting product:', payload);

      const response = await fetch(`${API_BASE_URL}/products-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Create product response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create product');
      }

      toast.success("Product created successfully!", { id: toastId });
      handleCloseAddModal();
      
      // Refresh the products list
      fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || "Failed to create product. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const toastId = toast.loading("Updating product...");

    try {
      setSubmitting(true);

      const payload = {
        userId: formData.userId,
        productName: formData.productName.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        purchaseDate: formData.purchaseDate,
      };

      console.log('Updating product:', payload);

      const response = await fetch(`${API_BASE_URL}/products-update/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Update product response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update product');
      }

      toast.success("Product updated successfully!", { id: toastId });
      handleCloseEditModal();
      
      // Refresh the products list
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || "Failed to update product. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#6b7280',
            },
          },
        }}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Sold Products</h2>
        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer font-medium shadow-md hover:shadow-lg"
        >
          + Add Product
        </button>
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

                  {/* Edit Button */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer font-medium"
                    >
                      Edit Product
                    </button>
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Add New Product</h3>
                <button
                  onClick={handleCloseAddModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitProduct}>
                {/* User Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-slate-500 py-2">Loading users...</div>
                  ) : (
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.userId ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={submitting}
                    >
                      <option value="">-- Select a user --</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.userId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.userId}</p>
                  )}
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.productName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.productName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.price ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.quantity ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.quantity && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                {/* Purchase Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.purchaseDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.purchaseDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.purchaseDate}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Edit Product</h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateProduct}>
                {/* User Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-slate-500 py-2">Loading users...</div>
                  ) : (
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.userId ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={submitting}
                    >
                      <option value="">-- Select a user --</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                  {formErrors.userId && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.userId}</p>
                  )}
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.productName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.productName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.productName}</p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.price ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.quantity ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.quantity && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                {/* Purchase Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purchase Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.purchaseDate ? 'border-red-500' : 'border-slate-300'
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.purchaseDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.purchaseDate}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;