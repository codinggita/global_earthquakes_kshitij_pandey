import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import {
  FiActivity,
  FiTrendingUp,
  FiCompass,
  FiMap,
  FiArrowRight,
  FiAlertTriangle
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, recentRes] = await Promise.all([
          API.get('/earthquakes/stats'),
          API.get('/earthquakes?limit=5&sort=time&order=desc')
        ]);

        if (statsRes.data?.status === 'success') {
          setStats(statsRes.data.data);
        }
        if (recentRes.data?.status === 'success') {
          setRecent(recentRes.data.data.earthquakes || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 bg-rose-50 rounded-full text-rose-650 mb-4">
          <FiAlertTriangle className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Error Loading Dashboard</h3>
        <p className="text-slate-500 mt-1 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary = {}, byCategory = [], byTime = [] } = stats || {};

  // Formatted data for time series chart (reversing it to show cronological order)
  const timeData = [...byTime].reverse().map((t) => ({
    name: `${t.month}/${t.year}`,
    count: t.count,
    avgMag: t.avgMagnitude
  }));

  // Colors for category pie chart
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Seismic Overview</h2>
          <p className="text-sm text-slate-505">Real-time statistics and historical earthquake metrics.</p>
        </div>
        <Link
          to="/earthquakes"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 self-start"
        >
          <span>Explore All Events</span>
          <FiArrowRight />
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <FiActivity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Tracked</p>
            <h4 className="text-2xl font-bold text-slate-800">{summary.totalEarthquakes || 0}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-rose-50 rounded-xl text-rose-600">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Highest Magnitude</p>
            <h4 className="text-2xl font-bold text-slate-800">{summary.maxMagnitude || '0.0'}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <FiCompass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Avg Magnitude</p>
            <h4 className="text-2xl font-bold text-slate-800">{summary.avgMagnitude || '0.0'}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <FiMap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Deepest Event</p>
            <h4 className="text-2xl font-bold text-slate-800">{summary.maxDepth || 0} km</h4>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Activity Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Earthquakes" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Severity Categories</h3>
          <div className="h-60 flex justify-center items-center">
            {byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                  >
                    {byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No category data available</p>
            )}
          </div>
          <div className="border-t border-slate-100 pt-4 mt-2">
            <p className="text-xs text-slate-450 text-center">
              Categorized according to standard USGS magnitude ranges.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Earthquakes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Seismic Events</h3>
          <Link to="/earthquakes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-750">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-505 uppercase text-xs tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-6 font-semibold">Place</th>
                <th className="py-3.5 px-6 font-semibold">Magnitude</th>
                <th className="py-3.5 px-6 font-semibold">Depth</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Time</th>
                <th className="py-3.5 px-6 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
              {recent.map((eq) => {
                const date = new Date(eq.time).toLocaleString();
                const isStrong = eq.mag >= 6.0;
                
                return (
                  <tr key={eq._id || eq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-800 max-w-xs truncate">{eq.place}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${isStrong ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}
                      `}>
                        {eq.mag.toFixed(1)} M
                      </span>
                    </td>
                    <td className="py-4 px-6">{eq.depth} km</td>
                    <td className="py-4 px-6 capitalize">{eq.status || 'reviewed'}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">{date}</td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/earthquakes/${eq._id || eq.id}`}
                        className="text-indigo-600 hover:text-indigo-805 text-sm font-semibold"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recent earthquakes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
