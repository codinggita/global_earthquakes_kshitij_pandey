import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile update form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setProfileMsg({ text: 'Please fill in name and email.', type: 'error' });
      return;
    }

    setProfileLoading(true);
    setProfileMsg({ text: '', type: '' });

    const res = await updateProfile({ name, email });
    setProfileLoading(false);

    if (res.success) {
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } else {
      setProfileMsg({ text: res.error, type: 'error' });
    }
  };

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: 'Please fill in all password fields.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ text: '', type: '' });

    const res = await changePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ text: res.error, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Account Center</h2>
        <p className="text-sm text-slate-500">Manage your user profile details and security configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Account Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 text-3xl font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-850 text-lg">{user?.name}</h3>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-900 text-slate-100">
            {user?.role}
          </span>
          <div className="border-t border-slate-100 pt-4 w-full text-left text-xs text-slate-450 space-y-1">
            <p>User ID: <span className="font-mono">{user?._id || user?.id}</span></p>
            <p>Account Status: <span className="font-semibold text-emerald-600">Active</span></p>
          </div>
        </div>

        {/* Right Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-805 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FiUser className="text-indigo-600 w-5 h-5" />
              <span>Update Personal Details</span>
            </h3>

            {profileMsg.text && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border
                ${profileMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-750'
                  : 'bg-rose-50 border-rose-100 text-rose-750'
                }
              `}>
                {profileMsg.type === 'success' ? (
                  <FiCheckCircle className="shrink-0 w-4 h-4" />
                ) : (
                  <FiAlertCircle className="shrink-0 w-4 h-4" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-805 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <FiLock className="text-indigo-600 w-5 h-5" />
              <span>Change Security Password</span>
            </h3>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 border
                ${passwordMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-750'
                  : 'bg-rose-50 border-rose-100 text-rose-750'
                }
              `}>
                {passwordMsg.type === 'success' ? (
                  <FiCheckCircle className="shrink-0 w-4 h-4" />
                ) : (
                  <FiAlertCircle className="shrink-0 w-4 h-4" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-505 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-505 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-505 uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
