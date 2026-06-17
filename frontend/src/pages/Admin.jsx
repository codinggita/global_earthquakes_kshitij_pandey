import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  FiUsers,
  FiShield,
  FiUserMinus,
  FiUserCheck,
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/users');
      if (res.data?.status === 'success') {
        // Handle both possible structures: { data: { users: [] } } or { data: [] }
        setUsers(res.data.data.users || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users list. Make sure you are an administrator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user role
  const handleToggleRole = async (userId, currentRole) => {
    setActionLoading(true);
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await API.patch(`/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setActionLoading(false);
    }
  };

  // Soft delete / Deactivate user
  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user? They will no longer be able to log in.')) return;
    setActionLoading(true);
    try {
      await API.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate user.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const activeCount = users.filter((u) => u.active !== false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Control Center</h2>
        <p className="text-sm text-slate-500">Supervise platform users, permissions, and security parameters.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Registered Users</p>
            <h4 className="text-2xl font-bold text-slate-800">{totalUsers}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-rose-50 rounded-xl text-rose-600">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Administrators</p>
            <h4 className="text-2xl font-bold text-slate-800">{adminCount}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Active Accounts</p>
            <h4 className="text-2xl font-bold text-slate-800">{activeCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Table & Error banner */}
      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-750 rounded-xl flex items-center space-x-2 text-sm">
          <FiAlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-150">
            <h3 className="text-lg font-bold text-slate-800">User Identity Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-505 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-6">User Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {users.map((u) => {
                  const id = u._id || u.id;
                  const isActive = u.active !== false;

                  return (
                    <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-800">{u.name}</td>
                      <td className="py-3.5 px-6">{u.email}</td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                          ${u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-100 text-slate-700'}
                        `}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
                        `}>
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggleRole(id, u.role)}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                          Toggle Role
                        </button>
                        {isActive && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleDeactivate(id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
