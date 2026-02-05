import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = 'https://mock-backend-two.vercel.app/api';

// Confirmation Modal Component (unchanged)
function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'delete':
        return {
          iconBg: 'bg-red-100',
          icon: '🗑️',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
        };
      case 'edit':
        return {
          iconBg: 'bg-indigo-100',
          icon: '✏️',
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-700',
        };
      default:
        return {
          iconBg: 'bg-gray-100',
          icon: '❓',
          confirmBtn: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className={`${styles.iconBg} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-2xl">{styles.icon}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-slate-600 text-center mb-6">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 ${styles.confirmBtn} text-white rounded-lg transition-colors duration-200 font-medium`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Form Modal Component (unchanged except onSubmit handling)
function UserFormModal({ isOpen, onClose, onSubmit, user = null, mode = 'add' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'customer',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'customer',
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!formData.role) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mode === 'add' ? 'bg-indigo-100' : 'bg-purple-100'}`}>
                <span className="text-xl">{mode === 'add' ? '➕' : '✏️'}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {mode === 'add' ? 'Add New User' : 'Edit User'}
              </h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="Enter user name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border ${errors.role ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'} rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white`}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200 font-medium cursor-pointer"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add User' : 'Update User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'delete',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [userFormModal, setUserFormModal] = useState({
    isOpen: false,
    mode: 'add',
    user: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/users-getall?page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();
      
      if (data?.message) {
        setUsers(data?.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || data.data?.length || 0,
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users-getall`);
      const data = await response.json();
      
      if (data.success) {
        const allUsers = data.data || [];
        const filtered = allUsers.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUsers(filtered);
        setPagination((prev) => ({ ...prev, total: filtered.length }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setLoading(false);
    }
  };

  const openAddUserModal = () => {
    setUserFormModal({ isOpen: true, mode: 'add', user: null });
  };

  const openEditUserModal = (user) => {
    setUserFormModal({ isOpen: true, mode: 'edit', user });
  };

  const closeUserFormModal = () => {
    setUserFormModal({ isOpen: false, mode: 'add', user: null });
  };

  const handleAddUser = async (formData) => {
    const toastId = toast.loading("Creating user...");

    try {
      const response = await fetch(`${API_BASE_URL}/users-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data?.message) {
        toast.success("User created successfully!", { id: toastId });
        fetchUsers();
        closeUserFormModal();
      } else {
        toast.error(data.message || "Failed to create user", { id: toastId });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("Something went wrong. Please try again.", { id: toastId });
    }
  };

  const handleEditUser = async (formData) => {
    const toastId = toast.loading("Updating user...");

    try {
      const response = await fetch(`${API_BASE_URL}/users-update/${userFormModal.user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data?.message) {
        toast.success("User updated successfully!", { id: toastId });
        fetchUsers();
        closeUserFormModal();
      } else {
        toast.error(data.message || "Failed to update user", { id: toastId });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Something went wrong. Please try again.", { id: toastId });
    }
  };

  const openDeleteModal = (user) => {
    setModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDelete(user._id),
    });
  };

  const confirmDelete = async (id) => {
    const toastId = toast.loading("Deleting user...");

    try {
      const response = await fetch(`${API_BASE_URL}/users-delete/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data?.message) {
        toast.success("User deleted successfully", { id: toastId });
        setUsers(users.filter((user) => user._id !== id));
      } else {
        toast.error(data.message || "Failed to delete user", { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Something went wrong while deleting.", { id: toastId });
    } finally {
      closeModal();
    }
  };

  const handleStatusChange = async (id, action) => {
    const isInactive = action === 'inactive';
    const actionWord = isInactive ? 'deactivated' : 'activated';
    const toastId = toast.loading(`${actionWord === 'activated' ? 'Activating' : 'Deactivating'} user...`);

    try {
      const response = await fetch(`${API_BASE_URL}/users-inactive/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isInactive }),
      });

      const data = await response.json();

      if (data?.message) {
        toast.success(`User ${actionWord} successfully!`, { id: toastId });
        fetchUsers();
      } else {
        toast.error(data.message || `Failed to ${action} user`, { id: toastId });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(`Failed to ${action} user. Please try again.`, { id: toastId });
    }
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: 'delete',
      title: '',
      message: '',
      onConfirm: () => {},
    });
  };

  const getRoleBadge = (role) => {
    const roleLower = (role || 'user').toLowerCase();
    const classes = {
      admin: 'bg-amber-100 text-amber-800',
      moderator: 'bg-blue-100 text-blue-800',
      customer: 'bg-indigo-100 text-indigo-800',
      user: 'bg-indigo-100 text-indigo-800',
    };
    return classes[roleLower] || classes.user;
  };

  const getStatusBadge = (user) => {
    if (user.isDelete) return { text: 'Deleted', class: 'bg-red-100 text-red-800' };
    if (user.isInactive) return { text: 'Inactive', class: 'bg-amber-100 text-amber-800' };
    return { text: 'Active', class: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="max-w-7xl">
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      {/* User Form Modal */}
      <UserFormModal
        isOpen={userFormModal.isOpen}
        onClose={closeUserFormModal}
        onSubmit={userFormModal.mode === 'add' ? handleAddUser : handleEditUser}
        user={userFormModal.user}
        mode={userFormModal.mode}
      />

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
        <button 
          onClick={openAddUserModal}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer"
        >
          ➕ Add User
        </button>
      </div>

      {/* Search Bar */}
      {/* <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 max-w-md px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
        >
          🔍
        </button>
      </div> */}

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const statusBadge = getStatusBadge(user);
                  return (
                    <tr key={user._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-5 py-4 text-sm text-slate-900">{user._id?.slice(-6) || 'N/A'}</td>
                      <td className="px-5 py-4 text-sm text-slate-900">{user.name || 'N/A'}</td>
                      <td className="px-5 py-4 text-sm text-slate-900">{user.email || 'N/A'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role || 'Customer'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-indigo-50 text-indigo-700 cursor-pointer rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                            title="Edit User"
                            onClick={() => openEditUserModal(user)}
                          >
                            ✏️
                          </button>

                          {!user.isDelete && user.isInactive && (
                            <button
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors duration-200 cursor-pointer"
                              title="Make Active"
                              onClick={() => handleStatusChange(user._id, 'active')}
                            >
                              ✅
                            </button>
                          )}

                          {!user.isDelete && !user.isInactive && (
                            <button
                              className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors duration-200 cursor-pointer"
                              title="Make Inactive"
                              onClick={() => handleStatusChange(user._id, 'inactive')}
                            >
                              🚫
                            </button>
                          )}

                          <button
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 cursor-pointer"
                            title="Delete User"
                            onClick={() => openDeleteModal(user)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
        <span className="text-sm text-slate-500">Showing {users.length} of {pagination.total} users</span>
        <div className="flex gap-2">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-500 text-sm hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ◀ Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-500">Page {pagination.page}</span>
          <button
            disabled={users.length < pagination.limit}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-500 text-sm hover:bg-slate-50 hover:border-indigo-500 hover:text-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}

export default Users;