import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';

const Earthquakes = () => {
  const { isAdmin } = useAuth();
  
  // Data list and loading states
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  
  // Query parameters state
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [minMag, setMinMag] = useState('');
  const [maxMag, setMaxMag] = useState('');
  const [minDepth, setMinDepth] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [sort, setSort] = useState('time');
  const [order, setOrder] = useState('desc');

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // Null for create, object for edit
  const [modalForm, setModalForm] = useState({
    id: '',
    mag: '',
    place: '',
    time: '',
    depth: '',
    status: 'reviewed',
    type: 'earthquake'
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch function
  const fetchEarthquakes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        sort,
        order
      };

      if (search) params.search = search;
      if (minMag) params.minMag = minMag;
      if (maxMag) params.maxMag = maxMag;
      if (minDepth) params.minDepth = minDepth;
      if (maxDepth) params.maxDepth = maxDepth;
      if (status) params.status = status;
      if (country) params.country = country;

      const res = await API.get('/earthquakes', { params });
      
      if (res.data?.status === 'success') {
        setEarthquakes(res.data.data.earthquakes || []);
        setTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load earthquake data. Please check connection or query.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, minMag, maxMag, minDepth, maxDepth, status, country, sort, order]);

  useEffect(() => {
    fetchEarthquakes();
  }, [fetchEarthquakes]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setMinMag('');
    setMaxMag('');
    setMinDepth('');
    setMaxDepth('');
    setStatus('');
    setCountry('');
    setPage(1);
  };

  // Handle sorting trigger
  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this earthquake record?')) return;
    try {
      await API.delete(`/earthquakes/${id}`);
      fetchEarthquakes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  // Modal open for create/edit
  const openModal = (eventObj = null) => {
    setModalError('');
    if (eventObj) {
      setCurrentEvent(eventObj);
      setModalForm({
        id: eventObj._id || eventObj.id,
        mag: eventObj.mag || '',
        place: eventObj.place || '',
        time: eventObj.time ? new Date(eventObj.time).toISOString().slice(0, 16) : '',
        depth: eventObj.depth || '',
        status: eventObj.status || 'reviewed',
        type: eventObj.type || 'earthquake'
      });
    } else {
      setCurrentEvent(null);
      setModalForm({
        id: `eq_${Date.now()}`,
        mag: '',
        place: '',
        time: new Date().toISOString().slice(0, 16),
        depth: '',
        status: 'reviewed',
        type: 'earthquake'
      });
    }
    setModalOpen(true);
  };

  // Submit modal form
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    const { id, mag, place, time, depth, status, type } = modalForm;

    if (!mag || !place || !time || !depth) {
      setModalError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        mag: parseFloat(mag),
        place,
        time: new Date(time).toISOString(),
        depth: parseFloat(depth),
        status,
        type
      };

      if (currentEvent) {
        // Edit Mode
        await API.patch(`/earthquakes/${currentEvent._id || currentEvent.id}`, payload);
      } else {
        // Create Mode
        payload.id = id;
        await API.post('/earthquakes', payload);
      }

      setModalOpen(false);
      fetchEarthquakes();
    } catch (err) {
      setModalError(err.response?.data?.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seismic Ledger</h2>
          <p className="text-sm text-slate-500">Query, view, and administer global earthquake events.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal(null)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 self-start"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Row 1: Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by location (e.g., Japan, California)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-900 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Query
          </button>
        </form>

        {/* Row 2: Range Filters & Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Min Magnitude</label>
            <input
              type="number"
              step="0.1"
              value={minMag}
              onChange={(e) => { setMinMag(e.target.value); setPage(1); }}
              placeholder="e.g. 4.5"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Max Magnitude</label>
            <input
              type="number"
              step="0.1"
              value={maxMag}
              onChange={(e) => { setMaxMag(e.target.value); setPage(1); }}
              placeholder="e.g. 9.0"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Min Depth (km)</label>
            <input
              type="number"
              value={minDepth}
              onChange={(e) => { setMinDepth(e.target.value); setPage(1); }}
              placeholder="e.g. 10"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Max Depth (km)</label>
            <input
              type="number"
              value={maxDepth}
              onChange={(e) => { setMaxDepth(e.target.value); setPage(1); }}
              placeholder="e.g. 700"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="reviewed">Reviewed</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-650 font-semibold rounded-lg text-sm transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center p-6">
            <FiAlertTriangle className="w-8 h-8 text-rose-550 mb-2" />
            <p className="text-slate-700 font-semibold">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                    <th className="py-3.5 px-6">Place</th>
                    <th className="py-3.5 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('mag')}>
                      Magnitude {sort === 'mag' && (order === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('depth')}>
                      Depth {sort === 'depth' && (order === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Network</th>
                    <th className="py-3.5 px-6 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('time')}>
                      Time {sort === 'time' && (order === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                  {earthquakes.map((eq) => {
                    const isStrong = eq.mag >= 6.0;
                    const id = eq._id || eq.id;
                    return (
                      <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-slate-800 max-w-xs truncate" title={eq.place}>
                          {eq.place}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                            ${isStrong ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}
                          `}>
                            {eq.mag.toFixed(1)} M
                          </span>
                        </td>
                        <td className="py-3.5 px-6">{eq.depth} km</td>
                        <td className="py-3.5 px-6 capitalize">{eq.status || 'reviewed'}</td>
                        <td className="py-3.5 px-6 uppercase text-slate-500">{eq.net || 'us'}</td>
                        <td className="py-3.5 px-6 text-xs text-slate-450">
                          {new Date(eq.time).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-2">
                          <Link
                            to={`/earthquakes/${id}`}
                            className="inline-flex p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-4.5 h-4.5" />
                          </Link>
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => openModal(eq)}
                                className="inline-flex p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Event"
                              >
                                <FiEdit className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(id)}
                                className="inline-flex p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Delete Event"
                              >
                                <FiTrash2 className="w-4.5 h-4.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {earthquakes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No earthquake records match the specified query filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Showing {earthquakes.length} of {total} records
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold px-3 py-1">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE & EDIT MODAL DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-150 animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {currentEvent ? 'Edit Earthquake Incident' : 'Record New Earthquake'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-450 hover:text-slate-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-650 rounded-xl text-xs flex items-center space-x-2">
                  <FiAlertTriangle className="shrink-0 w-4 h-4" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Magnitude *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalForm.mag}
                    onChange={(e) => setModalForm({ ...modalForm, mag: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Depth (km) *
                  </label>
                  <input
                    type="number"
                    value={modalForm.depth}
                    onChange={(e) => setModalForm({ ...modalForm, depth: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Place Name *
                </label>
                <input
                  type="text"
                  value={modalForm.place}
                  onChange={(e) => setModalForm({ ...modalForm, place: e.target.value })}
                  placeholder="e.g. 12km NNE of Kobe, Japan"
                  className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Time of Event *
                  </label>
                  <input
                    type="datetime-local"
                    value={modalForm.time}
                    onChange={(e) => setModalForm({ ...modalForm, time: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Verification Status
                  </label>
                  <select
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="reviewed">Reviewed</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-550 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/15 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earthquakes;
